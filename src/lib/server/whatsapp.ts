/**
 * Utility to send WhatsApp messages via a custom gateway.
 * Based on the user's curl example:
 * curl --request POST 'http://localhost:3000/send/message' \
 *      --user "username:password" \
 *      --header "Content-Type: application/json" \
 *      --data '{"phone":"6289685028129@s.whatsapp.net","message":"selamat malam"}'
 */

export async function sendWhatsApp(phoneNumber: string, message: string) {
    const url = process.env.WA_GATEWAY_URL || 'http://localhost:3000/send/message'
    const username = process.env.WA_AUTH_USER
    const password = process.env.WA_AUTH_PASS

    if (!username || !password) {
        console.warn('WhatsApp notification skipped: WA_AUTH_USER or WA_AUTH_PASS is not defined.')
        return
    }

    // Format phone number
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('08')) {
        cleanPhone = '628' + cleanPhone.slice(2)
    } else if (cleanPhone.startsWith('8')) {
        cleanPhone = '628' + cleanPhone.slice(1)
    }

    // Append context if not present
    if (!cleanPhone.includes('@')) {
        cleanPhone = `${cleanPhone}@s.whatsapp.net`
    }

    try {
        const auth = Buffer.from(`${username}:${password}`).toString('base64')
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                phone: cleanPhone,
                message: message,
                is_forwarded: false,
                duration: 0
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Failed to send WhatsApp message to ${cleanPhone}:`, errorText)
            return { success: false, error: errorText }
        }

        const result = await response.json()
        console.log(`WhatsApp message sent to ${cleanPhone}:`, result)
        return { success: true, result }
    } catch (error) {
        console.error(`Error sending WhatsApp notification to ${cleanPhone}:`, error)
        return { success: false, error }
    }
}
