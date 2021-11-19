import test from 'ava'
import { postalScraper } from './postalScraper'
import * as seed from './seed'

test('ava running', t => {
  t.pass()
})

test('MESSAGE > text ', t => {
  const actual = postalScraper(seed.textMessage)
  console.dir(actual)
  t.fail()
})
