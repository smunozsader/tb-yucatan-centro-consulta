// Data Context Provider for managing application state
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { dataService } from '../services/dataService.js'

const DataContext = createContext()

// Action types
const DATA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_AGREEMENTS: 'SET_AGREEMENTS',
  SET_FILTERED_AGREEMENTS: 'SET_FILTERED_AGREEMENTS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_SOURCE_FILTER: 'SET_SOURCE_FILTER',
  SELECT_AGREEMENT: 'SELECT_AGREEMENT',
  SHOW_EVIDENCE_MODAL: 'SHOW_EVIDENCE_MODAL',
  HIDE_EVIDENCE_MODAL: 'HIDE_EVIDENCE_MODAL'
}

// Initial state
const initialState = {
  loading: true,
  error: null,
  agreements: [],
  filteredAgreements: [],
  searchQuery: '',
  statusFilter: 'all',
  sourceFilter: 'all',
  selectedAgreement: null,
  showEvidenceModal: false,
  statistics: {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    bySources: {
      'CESO': 0,
      'APHIS-USDA': 0
    }
  }
}

// Reducer function
function dataReducer(state, action) {
  switch (action.type) {
    case DATA_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
      
    case DATA_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
      
    case DATA_ACTIONS.SET_AGREEMENTS:
      const agreements = action.payload
      const statistics = dataService.getStatistics(agreements)
      return {
        ...state,
        agreements,
        filteredAgreements: agreements,
        statistics,
        loading: false,
        error: null
      }
      
    case DATA_ACTIONS.SET_FILTERED_AGREEMENTS:
      return { ...state, filteredAgreements: action.payload }
      
    case DATA_ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload }
      
    case DATA_ACTIONS.SET_STATUS_FILTER:
      return { ...state, statusFilter: action.payload }
      
    case DATA_ACTIONS.SET_SOURCE_FILTER:
      return { ...state, sourceFilter: action.payload }
      
    case DATA_ACTIONS.SELECT_AGREEMENT:
      return { ...state, selectedAgreement: action.payload }
      
    case DATA_ACTIONS.SHOW_EVIDENCE_MODAL:
      return { 
        ...state, 
        showEvidenceModal: true,
        selectedAgreement: action.payload || state.selectedAgreement
      }
      
    case DATA_ACTIONS.HIDE_EVIDENCE_MODAL:
      return { 
        ...state, 
        showEvidenceModal: false,
        selectedAgreement: null
      }
      
    default:
      return state
  }
}

// Context Provider
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [state.agreements, state.searchQuery, state.statusFilter, state.sourceFilter])

  const loadData = async () => {
    try {
      dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: true })
      const agreements = await dataService.loadAllData()
      dispatch({ type: DATA_ACTIONS.SET_AGREEMENTS, payload: agreements })
    } catch (error) {
      dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error.message })
    }
  }

  const applyFilters = () => {
    let filtered = state.agreements

    // Apply search filter
    if (state.searchQuery) {
      filtered = dataService.searchAgreements(state.searchQuery, filtered)
    }

    // Apply status filter
    if (state.statusFilter !== 'all') {
      filtered = dataService.filterByStatus(state.statusFilter, filtered)
    }

    // Apply source filter
    if (state.sourceFilter !== 'all') {
      filtered = dataService.filterBySource(state.sourceFilter, filtered)
    }

    dispatch({ type: DATA_ACTIONS.SET_FILTERED_AGREEMENTS, payload: filtered })
  }

  const setSearchQuery = (query) => {
    dispatch({ type: DATA_ACTIONS.SET_SEARCH_QUERY, payload: query })
  }

  const setStatusFilter = (status) => {
    dispatch({ type: DATA_ACTIONS.SET_STATUS_FILTER, payload: status })
  }

  const setSourceFilter = (source) => {
    dispatch({ type: DATA_ACTIONS.SET_SOURCE_FILTER, payload: source })
  }

  const selectAgreement = (agreement) => {
    dispatch({ type: DATA_ACTIONS.SELECT_AGREEMENT, payload: agreement })
  }

  const showEvidenceModal = (agreement = null) => {
    dispatch({ type: DATA_ACTIONS.SHOW_EVIDENCE_MODAL, payload: agreement })
  }

  const hideEvidenceModal = () => {
    dispatch({ type: DATA_ACTIONS.HIDE_EVIDENCE_MODAL })
  }

  const refreshData = () => {
    loadData()
  }

  const contextValue = {
    ...state,
    // Actions
    setSearchQuery,
    setStatusFilter,
    setSourceFilter,
    selectAgreement,
    showEvidenceModal,
    hideEvidenceModal,
    refreshData,
    loadData
  }

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

// Custom hook to use the context
export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export { DATA_ACTIONS }
export default DataContext