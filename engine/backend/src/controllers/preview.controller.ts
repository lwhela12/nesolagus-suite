import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { getConfigLoader } from '../config/configLoader';
import { evaluateConditionalNext, evaluateCondition } from '../services/conditionalRouting';

interface SurveyState {
  surveyId: string;
  responseId: string;
  currentBlockId: string;
  variables: Record<string, any>;
  completedBlocks: string[];
  answers: Record<string, any>;
}

interface PreviewSession {
  sessionId: string;
  config: any; // Survey config
  state: SurveyState;
}

/**
 * Preview Controller
 * Handles preview mode for surveys - runs survey engine logic without database persistence
 * Accepts custom survey configs from studio for accurate preview
 */
class PreviewController {
  // In-memory storage for preview sessions
  private sessions: Map<string, PreviewSession> = new Map();

  /**
   * Start a preview session with a custom survey config
   */
  async startPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { config, name } = req.body;

      if (!config || !config.blocks) {
        throw new AppError('Survey config with blocks is required', 400);
      }

      const sessionId = uuidv4();
      const responseId = uuidv4(); // Mock response ID for preview

      // Get first block (b0)
      const firstBlockId = 'b0';
      const firstBlock = config.blocks[firstBlockId];

      if (!firstBlock) {
        throw new AppError('Survey config must have a block with id "b0"', 400);
      }

      // Initialize session state
      const state: SurveyState = {
        surveyId: config.survey?.id || 'preview',
        responseId,
        currentBlockId: firstBlockId,
        variables: {
          user_name: name || ''
        },
        completedBlocks: [],
        answers: {}
      };

      // Store session
      this.sessions.set(sessionId, {
        sessionId,
        config,
        state
      });

      // Format first question
      const formattedQuestion = this.formatQuestionForClient(firstBlock, state.variables);

      logger.debug('Preview session started', { sessionId, firstBlockId });

      res.json({
        sessionId,
        responseId,
        firstQuestion: formattedQuestion
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit an answer in preview mode
   */
  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, questionId, answer } = req.body;

      logger.debug('Preview answer submission', { sessionId, questionId, answer });

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new AppError('Invalid preview session ID', 400);
      }

      // Update state with answer
      this.updateState(session, questionId, answer);

      // Get next question
      const nextBlock = this.getNextQuestion(session, questionId, answer);

      // Calculate progress
      const progress = this.calculateProgress(session);

      res.json({
        nextQuestion: nextBlock ?
          this.formatQuestionForClient(nextBlock, session.state.variables) :
          null,
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear a preview session
   */
  async clearSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;

      this.sessions.delete(sessionId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update session state with answer
   * Mirrors surveyEngine.updateState logic
   */
  private updateState(session: PreviewSession, questionId: string, answer: any): void {
    const { state, config } = session;

    // Save answer
    state.answers[questionId] = answer;
    state.completedBlocks.push(questionId);

    // Update variables based on answer
    const block = config.blocks[questionId];

    // If the block has a variable field, store the answer in that variable
    if (block && block.variable) {
      state.variables[block.variable] = answer;
      logger.debug(`Stored answer in variable ${block.variable}:`, answer);
    }

    // Handle option-based variable updates
    if (block && block.options) {
      const selectedOption = Array.isArray(block.options) &&
        block.options.find((opt: any) => opt.value === answer || opt.id === answer);

      if (selectedOption && selectedOption.setVariables) {
        logger.debug('Setting variables from option:', selectedOption.setVariables);
        Object.assign(state.variables, selectedOption.setVariables);
      }
    }

    // Handle special variable updates (simplified version)
    this.updateSpecialVariables(state, questionId, answer);
  }

  /**
   * Update special derived variables based on specific questions
   * Mirrors surveyEngine.updateSpecialVariables logic
   */
  private updateSpecialVariables(state: SurveyState, questionId: string, answer: any): void {
    switch (questionId) {
      case 'b3': // Name
        state.variables.user_name = answer || '';
        break;
      case 'b4': // Connection type
        state.variables.connection_type = answer;
        break;
      case 'b5': // Arts connections
        state.variables.arts_connections = answer;
        state.variables.arts_connections_count = answer.length;
        state.variables.arts_connections_contains_other = answer.includes('other');
        break;
      case 'b6': // Arts importance
        state.variables.arts_importance = answer;
        break;
      case 'b16': // Contact methods selection
        if (Array.isArray(answer)) {
          state.variables.contact_methods = answer;
          state.variables.wants_email = answer.includes('email');
          state.variables.wants_text = answer.includes('text');
          state.variables.wants_print = answer.includes('print') || answer.includes('newsletter');
          state.variables.wants_social = answer.includes('social');
          state.variables.wants_conversations = answer.includes('conversations');
          state.variables.wants_no_updates = answer.includes('no-updates');
          state.variables.contact_info_needed = !!(
            state.variables.wants_email ||
            state.variables.wants_text ||
            state.variables.wants_print
          );
          state.variables.contact_info_confirmed = false;
          state.variables.contact_info_skipped = false;
        }
        break;
      case 'b16-contact-confirm':
        state.variables.contact_info_consent = answer;
        state.variables.contact_info_confirmed = answer === 'yes';
        state.variables.contact_info_skipped = answer === 'no';
        break;
      case 'b16a-contact':
        if (typeof answer === 'object' && answer !== null) {
          if (answer.firstName) state.variables.first_name = answer.firstName;
          if (answer.lastName) state.variables.last_name = answer.lastName;
          if (answer.address1) state.variables.contact_address1 = answer.address1;
          if (answer.address2) state.variables.contact_address2 = answer.address2;
          if (answer.city) state.variables.contact_city = answer.city;
          if (answer.state) state.variables.contact_state = answer.state;
          if (answer.zip) state.variables.contact_zip = answer.zip;
          if (answer.email) state.variables.contact_email = answer.email;
          if (answer.phone) state.variables.contact_phone = answer.phone;
          if (answer.type === 'skipped') state.variables.contact_form_skipped = true;
          state.variables.name_captured = !!(state.variables.first_name || state.variables.last_name);
          state.variables.contact_form_completed = true;
        } else {
          state.variables.contact_form_completed = true;
        }
        break;
      case 'b7': // VideoAsk personal story
        if (typeof answer === 'object' && answer !== null) {
          state.variables.personal_story_type = answer.type || 'skipped';
          state.variables.personal_story_response_id = answer.responseId || null;
          state.variables.personal_story_response_url = answer.responseUrl || null;
        } else {
          state.variables.personal_story_type = 'skipped';
        }
        break;
      case 'b12': // VideoAsk magic wand question
        if (typeof answer === 'object' && answer !== null) {
          state.variables.future_vision_type = answer.type || 'skipped';
          state.variables.future_vision_response_id = answer.responseId || null;
          state.variables.future_vision_response_url = answer.responseUrl || null;
        } else {
          state.variables.future_vision_type = 'skipped';
        }
        break;
      case 'b18': // Demographics consent
        state.variables.demographics_consent = answer;
        break;
      case 'b19': // Demographics answers
        if (typeof answer === 'object' && answer !== null) {
          Object.assign(state.variables, answer);
        }
        break;
    }
  }

  /**
   * Get next question based on current question and answer
   * Mirrors surveyEngine.getNextQuestion logic
   */
  private getNextQuestion(session: PreviewSession, currentQuestionId: string, answer: any): any {
    const { state, config } = session;

    // Handle dynamic empty-message blocks
    if (currentQuestionId.endsWith('-empty-message')) {
      const originalQuestionId = currentQuestionId.replace('-empty-message', '');
      const originalBlock = config.blocks[originalQuestionId];
      if (originalBlock && originalBlock.onEmpty) {
        const nextBlockId = originalBlock.onEmpty.next || originalBlock.next;
        if (nextBlockId) {
          state.currentBlockId = nextBlockId;
          const nextBlock = config.blocks[nextBlockId];
          return nextBlock;
        }
      }
    }

    const currentBlock = config.blocks[currentQuestionId];
    if (!currentBlock) {
      logger.error('No block found for ID:', currentQuestionId);
      return null;
    }

    let nextBlockId: string | null = null;

    // Handle onEmpty case for empty answers
    if (answer === '' && currentBlock.onEmpty) {
      if (currentBlock.onEmpty.message) {
        return {
          id: `${currentQuestionId}-empty-message`,
          type: 'dynamic-message',
          content: currentBlock.onEmpty.message,
          next: currentBlock.onEmpty.next || currentBlock.next
        };
      }
      nextBlockId = currentBlock.onEmpty.next || currentBlock.next;
    }
    // Default next (only if it's a string, not a conditional object)
    else if (currentBlock.next && typeof currentBlock.next === 'string') {
      nextBlockId = currentBlock.next;
    }

    // Handle option-based navigation
    if (currentBlock.options && Array.isArray(currentBlock.options)) {
      const selectedOption = currentBlock.options.find((opt: any) =>
        opt.value === answer || opt.id === answer
      );
      if (selectedOption && selectedOption.next) {
        nextBlockId = selectedOption.next;
      }
    }

    // Handle conditional routing - check both new format (next) and legacy format (conditionalNext)
    if (!nextBlockId) {
      // New format: next field with if/else array
      if (currentBlock.next && typeof currentBlock.next === 'object') {
        nextBlockId = evaluateConditionalNext(currentBlock.next, state.variables, currentBlock.variable);
      }
      // Legacy format: conditionalNext field
      else if (currentBlock.conditionalNext) {
        nextBlockId = evaluateConditionalNext(currentBlock.conditionalNext, state.variables, currentBlock.variable);
      }
    }

    // Handle showIf conditional display
    if (nextBlockId) {
      const nextBlock = config.blocks[nextBlockId];
      if (nextBlock && nextBlock.showIf) {
        const shouldShow = evaluateCondition(nextBlock.showIf, state.variables);
        if (!shouldShow) {
          state.currentBlockId = nextBlockId;
          return this.getNextQuestion(session, nextBlockId, null);
        }
      }
    }

    if (nextBlockId) {
      state.currentBlockId = nextBlockId;
      const nextBlock = config.blocks[nextBlockId];

      // Auto-advance through empty routing blocks
      if (nextBlock && (nextBlock.type === 'routing' ||
          (nextBlock.type === 'dynamic-message' &&
           (!nextBlock.content || nextBlock.content === '') &&
           nextBlock.conditionalNext))) {
        logger.debug('Auto-advancing through routing block:', nextBlockId);
        return this.getNextQuestion(session, nextBlockId, 'acknowledged');
      }

      return nextBlock;
    }

    return null;
  }

  /**
   * Calculate progress based on completed blocks
   * Simplified version of surveyEngine.calculateProgress
   */
  private calculateProgress(session: PreviewSession): number {
    const { state } = session;

    // Define main path (simplified)
    const mainPath = [
      'b1', 'b2', 'b3', 'b4', 'b4a', 'b5', 'b6', 'b7', 'b8', 'b9',
      'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17', 'b18'
    ];

    const expectedBlocks = [...mainPath];

    // Add conditional blocks based on user's path
    const contactNeeded = !!state.variables.contact_info_needed;
    const contactConfirmed = state.variables.contact_info_confirmed === true;
    const wantsSocial = state.variables.wants_social === true;
    const wantsChat = state.variables.wants_conversations === true;

    if (contactNeeded) {
      expectedBlocks.push('b16-contact-confirm');
      if (contactConfirmed) {
        expectedBlocks.push('b16-contact-great');
        expectedBlocks.push('b16-contact-preface');
        expectedBlocks.push('b16a-contact');
      }
    }

    if ((!contactNeeded || contactConfirmed) && wantsChat) expectedBlocks.push('b16-chat-again');
    if ((!contactNeeded || contactConfirmed) && wantsSocial) expectedBlocks.push('b16a-social');

    if (state.variables.demographics_consent === true) {
      expectedBlocks.push('b19');
    }

    expectedBlocks.push('b20');

    const completedCount = expectedBlocks.filter(blockId =>
      state.completedBlocks.includes(blockId)
    ).length;

    const progress = Math.round((completedCount / expectedBlocks.length) * 100);

    return Math.min(progress, 100);
  }

  /**
   * Format question for client with variable replacement
   * Mirrors surveyEngine.formatQuestionForClient logic
   */
  private formatQuestionForClient(question: any, variables: Record<string, any>): any {
    const formatted = JSON.parse(JSON.stringify(question));

    const replaceVariables = (text: string): string => {
      // Handle if-else conditionals
      text = text.replace(/\{\{#if (\w+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/g,
        (_match, varName, ifText, elseText) => {
          return variables[varName] ? ifText : elseText;
        }
      );

      // Handle if conditionals without else
      text = text.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/g,
        (_match, varName, ifText) => {
          return variables[varName] ? ifText : '';
        }
      );

      // Handle simple variable replacements
      text = text.replace(/\{\{(\w+)\}\}/g, (_match, varName) => {
        return variables[varName] || '';
      });

      return text;
    };

    // Replace in content
    if (typeof formatted.content === 'string') {
      formatted.content = replaceVariables(formatted.content);
    } else if (typeof formatted.content === 'object' && formatted.contentCondition) {
      const conditionResult = evaluateCondition(formatted.contentCondition.if, variables);
      const contentKey = conditionResult ? formatted.contentCondition.then : formatted.contentCondition.else;
      formatted.content = replaceVariables(formatted.content[contentKey]);
    } else if (formatted.type === 'dynamic-message' && typeof formatted.content === 'object') {
      let selectedContent = formatted.content.default || 'Thanks for sharing!';

      if (variables.connection_type && formatted.content[variables.connection_type]) {
        selectedContent = formatted.content[variables.connection_type];
      }

      formatted.content = replaceVariables(selectedContent);
    }

    // Handle conditionalContent array
    if (formatted.conditionalContent && Array.isArray(formatted.conditionalContent)) {
      let matchedContent = null;

      for (const item of formatted.conditionalContent) {
        if (item.condition === 'default') {
          matchedContent = item.content;
          break;
        }
        if (evaluateCondition(item.condition, variables)) {
          matchedContent = item.content;
          break;
        }
      }

      if (matchedContent && (formatted.content === 'placeholder' || formatted.content === '')) {
        formatted.content = replaceVariables(matchedContent);
      }
    }

    // Replace variables in options
    if (formatted.options && Array.isArray(formatted.options)) {
      formatted.options = formatted.options.map((option: any) => ({
        ...option,
        label: option.label ? replaceVariables(option.label) : option.label
      }));
    }

    // Replace variables in placeholder
    if (formatted.placeholder) {
      formatted.placeholder = replaceVariables(formatted.placeholder);
    }

    return formatted;
  }

  async getDashboardConfig(_req: Request, res: Response, next: NextFunction) {
    try {
      const configLoader = getConfigLoader();
      const dashboard = await configLoader.getDashboard();

      if (!dashboard) {
        res.status(404).json({
          success: false,
          message: 'Dashboard configuration not found'
        });
        return;
      }

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      next(error);
    }
  }
}

export const previewController = new PreviewController();
