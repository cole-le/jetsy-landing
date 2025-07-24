import React, { useState } from 'react'
import { trackEvent } from '../utils/analytics'

const OnboardingForm = ({ onSubmit, startupIdea, selectedPlan, onReset }) => {
  const [formData, setFormData] = useState({
    ideaTitle: '',
    description: '',
    audience: '',
    validationGoal: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationGoals = [
    'Validate market demand',
    'Test pricing strategy',
    'Understand user needs',
    'Gauge feature interest',
    'Measure conversion rates'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.ideaTitle.trim()) {
      newErrors.ideaTitle = 'Idea title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters'
    }

    if (!formData.audience.trim()) {
      newErrors.audience = 'Target audience is required'
    }

    if (!formData.validationGoal) {
      newErrors.validationGoal = 'Please select a validation goal'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    trackEvent('onboarding_form_submit', {
      has_idea_title: !!formData.ideaTitle,
      has_description: !!formData.description,
      plan_type: selectedPlan?.type || 'free'
    })

    try {
      await onSubmit(formData)
      // Removed onboarding_form_success tracking
    } catch (error) {
      console.error('Error submitting onboarding form:', error)
      trackEvent('onboarding_form_error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-text">Tell Us About Your Idea</h2>
          <p className="text-mutedText font-normal">We'll use this to generate your validation landing page</p>
        </div>

        {/* Plan Summary */}
        {selectedPlan && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-2 text-text">Selected Plan:</h3>
            <div className="flex items-center justify-between">
              <span className="text-text font-normal">{selectedPlan.name}</span>
              <span className="text-mutedText font-normal">${selectedPlan.price}/month</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Idea Title */}
          <div>
            <label htmlFor="ideaTitle" className="block text-sm font-semibold text-text mb-2">
              Idea Title *
            </label>
            <input
              type="text"
              id="ideaTitle"
              value={formData.ideaTitle}
              onChange={(e) => handleInputChange('ideaTitle', e.target.value)}
              className={`input-field ${errors.ideaTitle ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., AI-powered fitness coach for busy professionals"
            />
            {errors.ideaTitle && (
              <p className="mt-1 text-sm text-red-500">{errors.ideaTitle}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-text mb-2">
              Short Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`input-field ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Describe your idea in detail. What problem does it solve? What makes it unique?"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-mutedText font-normal">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Audience */}
          <div>
            <label htmlFor="audience" className="block text-sm font-semibold text-text mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              id="audience"
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              className={`input-field ${errors.audience ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Small business owners, 25-45 years old, tech-savvy"
            />
            {errors.audience && (
              <p className="mt-1 text-sm text-red-500">{errors.audience}</p>
            )}
          </div>

          {/* Validation Goal */}
          <div>
            <label htmlFor="validationGoal" className="block text-sm font-semibold text-text mb-2">
              Validation Goal *
            </label>
            <select
              id="validationGoal"
              value={formData.validationGoal}
              onChange={(e) => handleInputChange('validationGoal', e.target.value)}
              className={`input-field ${errors.validationGoal ? 'border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Select a validation goal</option>
              {validationGoals.map((goal, index) => (
                <option key={index} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
            {errors.validationGoal && (
              <p className="mt-1 text-sm text-red-500">{errors.validationGoal}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating your landing page...
              </div>
            ) : (
              "Generate My Landing Page"
            )}
          </button>
        </form>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={onReset}
            className="text-mutedText hover:text-text transition-colors duration-200"
          >
            ← Back to start
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingForm 