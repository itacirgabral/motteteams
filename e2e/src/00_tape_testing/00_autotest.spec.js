const test = require('tape')

test('timing test', function (t) {
  t.plan(2)

  t.pass('aaa pass')
  
  setTimeout(function () {
    t.pass('bbb pass')
  }, 1000)
});

test('test using promises', async function (t) {
  await new Promise(res => setTimeout(() => res(), 1000))
  t.pass('passing')
})