const _ = require('lodash')

module.exports.ethTransaction = (txResp) => {

    const filterEvents = (event) => {
      return _.filter(txResp.logs, { event })
    }
    
    const assertEvent = (eventParams) => {
      const events = filterEvents(eventParams.event)
      assert.equal(events.length, 1, `expected 1 ${eventParams.event} event but got ${events.length}`)
      const event = events[0]
      _.forEach(_.keys(eventParams), (p) => {
        if (p !== 'event') {
          assert.equal(
            event.args[p],
            eventParams[p],
            `expected event property '${eventParams.event}.${p} to be ${eventParams[p]}, ` +
              `but got ${event.args[p]}`
          )
        }
      })
    }
    
    return { filterEvents, assertEvent }

}

