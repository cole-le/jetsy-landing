import React, { useState } from 'react'
import { trackEvent } from '../utils/analytics'

const DemoBookingForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.email.trim()) newErrors.email = 'Work email is required'
    else if (!validateEmail(form.email)) newErrors.email = 'Please enter a valid email address'
    if (!form.company.trim()) newErrors.company = "Company's website is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    trackEvent('demo_form_submit_attempt', form)
    try {
      await onSubmit(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-text">Contact details</h2>
          <p className="text-mutedText font-normal">Curious to discover how Jetsy can help validate your idea? Meet with one of our product experts to learn more.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-text mb-2">First name*</label>
            <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="John" />
            {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-text mb-2">Last name*</label>
            <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="Doe" />
            {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text mb-2">Work email*</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="e.g. john@company.com" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-text mb-2">Phone number</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="e.g. 1234567890" />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-semibold text-text mb-2">Company's website*</label>
            <input type="text" id="company" name="company" value={form.company} onChange={handleChange} className={`input-field ${errors.company ? 'border-red-500 focus:ring-red-500' : ''}`} placeholder="e.g. company.com" />
            {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Requesting demo...
              </div>
            ) : (
              'Request Demo'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DemoBookingForm 