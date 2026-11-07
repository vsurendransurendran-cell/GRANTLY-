import { Check, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="toast" role="status" aria-live="polite" aria-atomic="true">
      <span className="toast-check"><Check size={15} aria-hidden="true" /></span>
      <span>{message.message}</span>
      <button className="toast-dismiss" type="button" onClick={onClose} aria-label="Dismiss notification">
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
