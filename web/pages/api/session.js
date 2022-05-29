import sessions from '../../lib/sessions'

export default function handler(req, res) {
  if(req.method === 'PUT') {
    try {
      sessions.add(req.body.nonce, req.body.signature)
      res.status(200).end()
    } catch(e) {
      res.status(500).json({ error: e})
    }
  } else {
    res.status(500).end()
  }
}
