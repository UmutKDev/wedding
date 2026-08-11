import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError: () => void
}

interface State {
  failed: boolean
}

/**
 * 3B sahne için güvenlik ağı.
 *
 * WebGL başlatılamayabilir (eski cihaz, sürücü hatası, uygulama içi
 * tarayıcı kısıtı, GPU bağlamı kaybı). Bu durumda davetiyenin tamamı
 * çökmemeli — sadece arka plan sahnesi sessizce devre dışı kalmalı,
 * içerik 2B olarak okunmaya devam etmeli.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn('3B sahne devre dışı bırakıldı:', error, info.componentStack)
    }
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
