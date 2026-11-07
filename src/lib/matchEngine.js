import { INCOME_OPTIONS } from '../data/options.js'

const WEIGHTS = {
  field: 30,
  level: 20,
  country: 20,
  gpa: 15,
  income: 10,
  category: 5,
}

function includesAnyOrValue(values, profileValue) {
  return Array.isArray(values) && (values.includes('Any') || values.includes(profileValue))
}

function incomeLabel(value) {
  return INCOME_OPTIONS.find((option) => option.value === Number(value))?.label ?? 'Unknown'
}

export function evaluate(scholarship, profile) {
  const requiredFields = Array.isArray(scholarship.fields) ? scholarship.fields : []
  const requiredLevels = Array.isArray(scholarship.level) ? scholarship.level : []
  const requiredCountries = Array.isArray(scholarship.countries) ? scholarship.countries : []
  const requiredCategories = Array.isArray(scholarship.categories) ? scholarship.categories : []
  const studentCategories = Array.isArray(profile.categories) ? profile.categories : []
  const minGpa = Number(scholarship.minGpa) || 0
  const studentGpa = Number(profile.gpa) || 0
  const maxIncome = Number(scholarship.maxIncome) || 3
  const studentIncome = Number(profile.income) || 3

  const fieldMet = includesAnyOrValue(requiredFields, profile.field)
  const levelMet = includesAnyOrValue(requiredLevels, profile.level)
  const countryMet = includesAnyOrValue(requiredCountries, profile.country)
  const gpaStatus = minGpa === 0 || studentGpa >= minGpa
    ? 'met'
    : studentGpa >= minGpa - 0.3
      ? 'partial'
      : 'unmet'
  const incomeMet = maxIncome === 3 || studentIncome <= maxIncome
  const categoryOverlap = requiredCategories.filter((category) => studentCategories.includes(category))
  const categoryMet = requiredCategories.length === 0 || categoryOverlap.length > 0

  const criteria = [
    {
      key: 'field',
      label: 'Field of study',
      detail: requiredFields.includes('Any')
        ? 'Any field of study is accepted.'
        : fieldMet
          ? `${profile.field} is included in the eligible fields.`
          : `Eligible fields: ${requiredFields.join(', ')} (yours: ${profile.field}).`,
      status: fieldMet ? 'met' : 'unmet',
      weight: WEIGHTS.field,
    },
    {
      key: 'level',
      label: 'Study level',
      detail: requiredLevels.includes('Any')
        ? 'Any study level is accepted.'
        : levelMet
          ? `${profile.level} is an eligible study level.`
          : `Eligible levels: ${requiredLevels.join(', ')} (yours: ${profile.level}).`,
      status: levelMet ? 'met' : 'unmet',
      weight: WEIGHTS.level,
    },
    {
      key: 'country',
      label: 'Country',
      detail: requiredCountries.includes('Any')
        ? 'Applicants from any country may apply.'
        : countryMet
          ? `${profile.country} is an eligible country.`
          : `Eligible countries: ${requiredCountries.join(', ')} (yours: ${profile.country}).`,
      status: countryMet ? 'met' : 'unmet',
      weight: WEIGHTS.country,
    },
    {
      key: 'gpa',
      label: 'Minimum GPA',
      detail: minGpa === 0
        ? 'No minimum GPA is set.'
        : `Minimum GPA ${minGpa.toFixed(1)} (yours: ${studentGpa.toFixed(1)}).`,
      status: gpaStatus,
      weight: WEIGHTS.gpa,
    },
    {
      key: 'income',
      label: 'Income band',
      detail: maxIncome === 3
        ? 'There is no income-band limit.'
        : `Eligible up to ${incomeLabel(maxIncome)} income (yours: ${incomeLabel(studentIncome)}).`,
      status: incomeMet ? 'met' : 'unmet',
      weight: WEIGHTS.income,
    },
    {
      key: 'category',
      label: 'Student category',
      detail: requiredCategories.length === 0
        ? 'No category is required.'
        : categoryMet
          ? `Required category matched: ${categoryOverlap.join(', ')}.`
          : `Required category: ${requiredCategories.join(' or ')} (none selected in your profile).`,
      status: categoryMet ? 'met' : 'unmet',
      weight: WEIGHTS.category,
    },
  ]

  const weightedScore = criteria.reduce((sum, criterion) => {
    const credit = criterion.status === 'met' ? 1 : criterion.status === 'partial' ? 0.5 : 0
    return sum + criterion.weight * credit
  }, 0)

  return {
    score: Math.round(weightedScore),
    eligible: criteria.every((criterion) => criterion.status !== 'unmet'),
    criteria,
  }
}
