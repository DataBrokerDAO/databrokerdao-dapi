const axios = require('axios')

const GATEWAY_OPERATOR_PRIVATE_KEY =
  'ca1398820695e93cea849b841a9aae4eeae65518d14353ab73d21fa4af2d58a7'
const GATEWAY_OPERATOR_ADDRESS = '0x3df2fd51cf19c0d8d1861d6ebc6457a1b0c7496f'

function getBaseUrl(network) {
  switch (network) {
    case 'minttestnet':
      return 'https://dapi-staging.databrokerdao.com'
    case 'development':
    default:
      return 'http://localhost:3333'
  }
}

async function authenticate(network) {
  try {
    const res = await axios({
      url: `${getBaseUrl(network)}/authenticate`,
      method: 'POST',
      data: {
        privateKeys: {
          ethereum: GATEWAY_OPERATOR_PRIVATE_KEY,
        },
        encrypted: false,
      },
    })

    return res.data.token
  } catch (e) {
    console.log('Authenticate failed: ', e)
  }
}

async function addIpfs(metadata, token, network) {
  try {
    const res = await axios({
      url: `${getBaseUrl(network)}/ipfs/add/json`,
      method: 'POST',
      data: metadata,
      headers: {
        Authorization: token,
      },
    })
    return res.data[0].hash
  } catch (e) {
    console.log('AddIpfs failed: ', e)
  }
}

module.exports = {
  GATEWAY_OPERATOR_ADDRESS,
  GATEWAY_OPERATOR_PRIVATE_KEY,
  getBaseUrl,
  authenticate,
  addIpfs,
}
