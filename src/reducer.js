import { CASE_TEMPLATES } from './constants'
import { generateSystemPrompts } from './prompts'

// --- Helpers ---
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function buildInitialSuspects(caseTemplate, culpritId) {
  const systemPrompts = generateSystemPrompts(caseTemplate, culpritId)
  const suspects = {}
  for (const s of caseTemplate.suspects) {
    const isCulprit = s.id === culpritId
    suspects[s.id] = {
      chatHistory: [],
      emotionState: 'calm',
      profile: { ...s, isCulprit, systemPrompt: systemPrompts[s.id] },
    }
  }
  return suspects
}

// --- Initial State ---
export const initialState = {
  phase: 'start',
  currentCase: null,
  culpritId: null,
  questionsRemaining: 0,
  questionsTotal: 0,
  usedForensicClues: [],
  activeSuspect: null,
  suspects: {},
  clues: [],
  accusation: { targetId: null, reason: '' },
  verdict: null,
  isLoading: false,
  dynamicPublicClues: null,
  dynamicForensicClues: null,
  cluesAiGenerated: false,
}

// --- Reducer ---
export function gameReducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME': {
      return { ...initialState, phase: 'case_select' }
    }

    case 'SELECT_CASE': {
      const caseTemplate = CASE_TEMPLATES.find(c => c.id === action.caseId)
      if (!caseTemplate) return state
      const culpritId = pickRandom(caseTemplate.suspects).id
      return {
        ...initialState,
        currentCase: caseTemplate,
        culpritId,
        phase: 'generating',
        questionsRemaining: 25,
        questionsTotal: 25,
        activeSuspect: caseTemplate.suspects[0].id,
        suspects: buildInitialSuspects(caseTemplate, culpritId),
      }
    }

    case 'SEND_MESSAGE': {
      const { suspectId, text } = action
      const suspect = state.suspects[suspectId]
      if (!suspect || state.questionsRemaining <= 0) return state
      const msg = {
        id: generateId(),
        role: 'player',
        text,
        timestamp: Date.now(),
      }
      return {
        ...state,
        questionsRemaining: state.questionsRemaining - 1,
        isLoading: true,
        suspects: {
          ...state.suspects,
          [suspectId]: {
            ...suspect,
            chatHistory: [...suspect.chatHistory, msg],
          },
        },
      }
    }

    case 'RECEIVE_MESSAGE': {
      const { suspectId, text, emotionMark } = action
      const suspect = state.suspects[suspectId]
      if (!suspect) return state
      const msg = {
        id: generateId(),
        role: 'suspect',
        text: text.replace(/^\[紧张\]|^\[慌乱\]/, '').trim(),
        emotionMark: emotionMark || null,
        timestamp: Date.now(),
      }
      const newEmotion =
        emotionMark === '慌乱' ? 'agitated'
        : emotionMark === '紧张' ? 'nervous'
        : suspect.emotionState
      return {
        ...state,
        isLoading: false,
        suspects: {
          ...state.suspects,
          [suspectId]: {
            ...suspect,
            emotionState: newEmotion,
            chatHistory: [...suspect.chatHistory, msg],
          },
        },
      }
    }

    case 'CHAT_ERROR': {
      return {
        ...state,
        isLoading: false,
        // refund the question that was deducted if the API truly failed
        questionsRemaining: action.refund
          ? Math.min(state.questionsRemaining + 1, state.questionsTotal)
          : state.questionsRemaining,
      }
    }

    case 'SET_LOADING': {
      return { ...state, isLoading: true }
    }

    case 'SWITCH_SUSPECT': {
      return { ...state, activeSuspect: action.suspectId }
    }

    case 'SAVE_CLUE': {
      const { suspectId, text } = action
      const clue = {
        id: generateId(),
        text,
        sourceQuote: text,
        suspectId,
        timestamp: Date.now(),
      }
      return { ...state, clues: [...state.clues, clue] }
    }

    case 'EDIT_CLUE': {
      return {
        ...state,
        clues: state.clues.map(c =>
          c.id === action.clueId ? { ...c, text: action.newText } : c
        ),
      }
    }

    case 'DELETE_CLUE': {
      return {
        ...state,
        clues: state.clues.filter(c => c.id !== action.clueId),
      }
    }

    case 'ADD_FORENSIC_CLUE': {
      const pool = state.dynamicForensicClues || state.currentCase.forensicClues
      const available = pool.filter((_, i) => !state.usedForensicClues.includes(i))
      if (available.length === 0 || state.questionsRemaining <= 0) return state
      const picked = pickRandom(available)
      const pickedIndex = pool.indexOf(picked)
      const clue = {
        id: generateId(),
        text: picked,
        sourceQuote: picked,
        suspectId: '__forensic__',
        timestamp: Date.now(),
      }
      return {
        ...state,
        questionsRemaining: state.questionsRemaining - 1,
        usedForensicClues: [...state.usedForensicClues, pickedIndex],
        clues: [...state.clues, clue],
      }
    }

    case 'SET_DYNAMIC_CLUES': {
      return {
        ...state,
        dynamicPublicClues: action.publicClues,
        dynamicForensicClues: action.forensicClues,
        cluesAiGenerated: action.aiGenerated,
        phase: 'briefing',
      }
    }

    case 'GO_TO_INTERROGATION': {
      return { ...state, phase: 'interrogation' }
    }

    case 'BACK_TO_START': {
      return { ...initialState }
    }

    case 'BACK_TO_INTERROGATION': {
      return { ...state, phase: 'interrogation' }
    }

    case 'GO_TO_ACCUSATION': {
      return { ...state, phase: 'accusation' }
    }

    case 'SET_ACCUSATION_TARGET': {
      return {
        ...state,
        accusation: { ...state.accusation, targetId: action.suspectId },
      }
    }

    case 'SET_ACCUSATION_REASON': {
      return {
        ...state,
        accusation: { ...state.accusation, reason: action.reason },
      }
    }

    case 'SUBMIT_ACCUSATION': {
      return { ...state, phase: 'judging', isLoading: true }
    }

    case 'SET_VERDICT': {
      return {
        ...state,
        phase: 'reveal',
        isLoading: false,
        verdict: action.verdict,
      }
    }

    default:
      return state
  }
}
