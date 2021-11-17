import test from 'ava'
import baileys2gmapi from '../src/index'

test('ava running', t => {
  t.pass()
})

test('baileys2gmapi running', t => {
  const actual = baileys2gmapi()
  const expected = 'olá mundo'
  t.is(actual, expected)
})
