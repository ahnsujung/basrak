import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
          <AlertTriangle size={40} className="text-amber-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">문제가 발생했습니다</h2>
          <p className="text-sm text-gray-500 mb-4">앱을 다시 불러와 주세요</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand text-white rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
