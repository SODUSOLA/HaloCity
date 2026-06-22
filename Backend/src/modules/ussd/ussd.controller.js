import catchAsync from '../../shared/catch-async.js';
import * as ussdService from './ussd.service.js';

export const webhook = catchAsync(async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;

  if (!phoneNumber || text === undefined) {
    return res.status(400).send('END Invalid request');
  }

  const result = await ussdService.handleUssd({ sessionId, phoneNumber, text });
  res.set('Content-Type', 'text/plain');
  res.send(`${result.type} ${result.message}`);
});
