import test from 'node:test'
import assert from 'node:assert/strict'
import { createQuizRound, scoreAnswers } from '../src/data/quiz.js'

test('creates a ten-question round with unique questions and four choices', () => {
  const round = createQuizRound(10, () => 0.37)
  assert.equal(round.length, 10)
  assert.equal(new Set(round.map(question => question.id)).size, 10)
  assert.ok(round.every(question => question.options.length === 4 && question.options.includes(question.answer)))
})

test('scores only correct answers at ten points each', () => {
  assert.equal(scoreAnswers([{ correct: true }, { correct: false }, { correct: true }]), 20)
})
