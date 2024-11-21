document.getElementById('screenshotBtn').addEventListener('click', () => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        const screenshotImage = document.getElementById('screenshotImage');
        screenshotImage.src = dataUrl;
        screenshotImage.style.display = 'block';

        const sendBtn = document.getElementById('sendBtn');
        sendBtn.style.display = 'inline-block';
    });
});

document.getElementById('sendBtn').addEventListener('click', async () => {
    const screenshotImage = document.getElementById('screenshotImage').src;
    const loaderElement = document.getElementById('loader');
    const chatgptResponse = document.getElementById('chatgptResponse');

    loaderElement.style.display = 'block';
    chatgptResponse.textContent = "";

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer YOUR_OWN_OPENAI_API`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: "Here is an image: " + screenshotImage }],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        const data = await response.json();
        chatgptResponse.textContent = data.choices[0].message.content.trim();
    } catch (error) {
        chatgptResponse.textContent = "Error fetching the answer.";
        console.error("Error sending the screenshot:", error);
    } finally {
        loaderElement.style.display = 'none';
    }
});
