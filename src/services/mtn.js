import metronome from 'metronomejs'
import Web3 from 'web3'

import settings from '../config/settings'

const provider = new Web3.providers.WebsocketProvider(settings.MTN_PUBLIC_NODE_URL)
const mtn = metronome.getInstance(provider)

mtn.mtntoken.options.address = settings.MTN_TOKEN_ADDR
mtn.auctions.options.address = settings.MTN_AUCTION_ADDR

export default mtn