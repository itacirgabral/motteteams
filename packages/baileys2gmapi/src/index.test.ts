import test from 'ava'
import baileys2gmapi from './index'
import * as seed from './seed'
import * as expected from './expected'

test('ava running', t => {
  t.pass()
})

test('MESSAGE > text ', t => {
  const actual = baileys2gmapi(seed.textMessage)
  t.deepEqual(actual, expected)
})
