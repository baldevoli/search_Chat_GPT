class ChatGPTService {
  async fetchAnswer(question) {
    const apiKey = "Your_Own_OpenAI_API";
    const url = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: question }],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
}

// Create context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithChatGPT",
    title: "Brave",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "searchWithChatGPT") {
    const selectedText = info.selectionText;
    if (selectedText) {
      try {
        const chatGPTService = new ChatGPTService();
        const answer = await chatGPTService.fetchAnswer(selectedText);

        chrome.notifications.create({
          type: "basic",
          iconUrl: "images/icon.png",
          title: "::",
          message: answer,
          priority: 2,
        }, function (notificationId) {
          setTimeout(() => {
            chrome.notifications.clear(notificationId);
          }, 500); // Closes after 0.5 seconds
        });

      } catch (error) {
        console.error("Error fetching the answer:", error);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "images/icon.png",
          title: "Error",
          message: "Failed to fetch response from ChatGPT."
        });
      }
    }
  }
});

// Handle keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  console.log("Received command:", command);  // Log the command to check if it’s firing
  if (command === "trigger-chatgpt-search") {
    // Get the selected text from the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if the URL is restricted
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
      console.warn("Cannot execute script on a restricted URL.");
      chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon.png",
        title: "Error",
        message: "Cannot execute script on this page."
      });
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    }, async (results) => {
      // Check if results are empty or undefined
      if (!results || results.length === 0 || !results[0].result) {
        console.warn("No text selected or failed to retrieve selection.");
        chrome.notifications.create({
          type: "basic",
          iconUrl: "images/icon.png",
          title: "Error",
          message: "No text selected or unable to retrieve text."
        });
        return;
      }

      const selectedText = results[0].result;

      if (selectedText) {
        try {
          const chatGPTService = new ChatGPTService();
          const answer = await chatGPTService.fetchAnswer(selectedText);

          chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon.png",
            title: "uttar::",
            message: answer,
            priority: 2,
          }, function (notificationId) {
            setTimeout(() => {
              chrome.notifications.clear(notificationId);
            }, 500);
          });

        } catch (error) {
          console.error("Error fetching the answer:", error);
          chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon.png",
            title: "Error",
            message: "Failed to fetch response from ChatGPT."
          });
        }
      }
    });
  }
});
