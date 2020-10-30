const got = require('got');

async function send() {
    let token = "ZD6pHPnnqHXoPnAeNmeAXzabl8oYEBjt"
    let base_url = "https://api.chainrider.io/v1/dash/testnet"
    // let transaction = "030000000131799dd23aeb56f9c911201e4cc355c6ada365f0d34ab197516794ab2a4f9459010000006a47304402206c9acb6ff3e1c7eec5709da00f88316cf0ae614eed21d542ad2ee2865b90bef0022079cced97bc33ae921b81f822a96d$
    // let tx_send_url = `${base_url}/tx/send`;
    // console.log('rawtx: %s', transaction)
    //
    // console.log('Posting to: %s', tx_send_url)
    // let options = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //     },
    //     body: JSON.stringify({ // have to manually stringify object in body
    //         rawtx: transaction,
    //         token: token
    //     })
    // };
    //
    // const response2 = await got.post(tx_send_url, options)
    // console.log(response2.body)
    // let dashTx = JSON.parse(response2.body).txid
    // console.log(dashTx)
    let dashTx = "41d1520349eb5e80d181133fdf91119a761e80d06907a86cf330d610f77d5158"
    let url = `https://api.chainrider.io/v1/dash/testnet/tx/${dashTx}?token=${token}`
    const response = await got(url);
    console.log(response.body)
    let opReturnData = JSON.parse(response.body)['vout'][0]['scriptPubKey']['asm'].split(' ')[1]
    console.log(opReturnData)

    const convert = (from, to) => str => Buffer.from(str, from).toString(to)
    const hexToASCII = convert('hex', 'ascii')
    const hexToUtf8 = convert('hex', 'utf8')
    let decoded_ascii = hexToASCII(opReturnData)
    let decoded_utf8 = hexToUtf8(opReturnData)

    console.log(decoded_ascii)
    console.log(decoded_utf8)
}

send()
