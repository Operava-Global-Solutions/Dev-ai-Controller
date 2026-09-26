(function() {
  var d = document;
  var currentScript = d.currentScript || (function() {
    var scripts = d.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var tenantId = currentScript ? currentScript.getAttribute('data-tenant') || 'tenant_prod_edge_001' : 'tenant_prod_edge_001';
  var agentId = currentScript ? currentScript.getAttribute('data-agent') || 'agent-customer-01' : 'agent-customer-01';

  var container = d.createElement('div');
  container.id = 'devai-customer-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  var button = d.createElement('button');
  button.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  button.style.width = '56px';
  button.style.height = '56px';
  button.style.borderRadius = '28px';
  button.style.backgroundColor = '#9333ea';
  button.style.backgroundImage = 'linear-gradient(135deg, #ff6b35 0%, #f38020 30%, #9333ea 75%, #7928ca 100%)';
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.boxShadow = '0 4px 14px rgba(147, 51, 234, 0.4)';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.transition = 'transform 0.2s';

  button.onmouseenter = function() { button.style.transform = 'scale(1.05)'; };
  button.onmouseleave = function() { button.style.transform = 'scale(1)'; };

  var chatWindow = d.createElement('div');
  chatWindow.style.display = 'none';
  chatWindow.style.width = '360px';
  chatWindow.style.height = '480px';
  chatWindow.style.backgroundColor = '#ffffff';
  chatWindow.style.borderRadius = '16px';
  chatWindow.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
  chatWindow.style.border = '1px solid #e2e4e9';
  chatWindow.style.flexDirection = 'column';
  chatWindow.style.overflow = 'hidden';
  chatWindow.style.marginBottom = '12px';

  var header = d.createElement('div');
  header.style.padding = '14px 16px';
  header.style.backgroundImage = 'linear-gradient(135deg, #ff6b35 0%, #f38020 30%, #9333ea 75%, #7928ca 100%)';
  header.style.color = '#ffffff';
  header.style.fontSize = '14px';
  header.style.fontWeight = 'bold';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<span>Customer Support AI</span><button id="devai-widget-close" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;">&times;</button>';

  var body = d.createElement('div');
  body.id = 'devai-widget-messages';
  body.style.flex = '1';
  body.style.padding = '14px';
  body.style.overflowY = 'auto';
  body.style.fontSize = '13px';
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.gap = '8px';
  body.innerHTML = '<div style="background:#f0f2f5;padding:10px 12px;border-radius:12px;color:#1a1d24;align-self:flex-start;max-width:85%;">Hello! Thanks for reaching out. How can I assist you today?</div>';

  var inputBar = d.createElement('div');
  inputBar.style.padding = '10px 12px';
  inputBar.style.borderTop = '1px solid #e2e4e9';
  inputBar.style.display = 'flex';
  inputBar.style.gap = '8px';

  var input = d.createElement('input');
  input.placeholder = 'Type your question...';
  input.style.flex = '1';
  input.style.padding = '8px 12px';
  input.style.border = '1px solid #e2e4e9';
  input.style.borderRadius = '8px';
  input.style.fontSize = '12px';
  input.style.outline = 'none';

  var sendBtn = d.createElement('button');
  sendBtn.innerText = 'Send';
  sendBtn.style.padding = '8px 14px';
  sendBtn.style.backgroundColor = '#9333ea';
  sendBtn.style.color = '#fff';
  sendBtn.style.border = 'none';
  sendBtn.style.borderRadius = '8px';
  sendBtn.style.fontSize = '12px';
  sendBtn.style.fontWeight = 'bold';
  sendBtn.style.cursor = 'pointer';

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);

  chatWindow.appendChild(header);
  chatWindow.appendChild(body);
  chatWindow.appendChild(inputBar);

  container.appendChild(chatWindow);
  container.appendChild(button);
  d.body.appendChild(container);

  var isOpen = false;
  button.onclick = function() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
  };

  header.querySelector('#devai-widget-close').onclick = function() {
    isOpen = false;
    chatWindow.style.display = 'none';
  };

  function sendMessage() {
    var txt = input.value.trim();
    if (!txt) return;

    var uMsg = d.createElement('div');
    uMsg.style.background = '#9333ea';
    uMsg.style.color = '#fff';
    uMsg.style.padding = '8px 12px';
    uMsg.style.borderRadius = '12px';
    uMsg.style.alignSelf = 'flex-end';
    uMsg.style.maxWidth = '85%';
    uMsg.innerText = txt;
    body.appendChild(uMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;

    var loadingMsg = d.createElement('div');
    loadingMsg.style.background = '#f0f2f5';
    loadingMsg.style.padding = '8px 12px';
    loadingMsg.style.borderRadius = '12px';
    loadingMsg.style.color = '#80868b';
    loadingMsg.style.alignSelf = 'flex-start';
    loadingMsg.innerText = 'Thinking...';
    body.appendChild(loadingMsg);
    body.scrollTop = body.scrollHeight;

    fetch('/v1/widget/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: txt, tenantId: tenantId, agentId: agentId })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      loadingMsg.remove();
      var botMsg = d.createElement('div');
      botMsg.style.background = '#f0f2f5';
      botMsg.style.color = '#1a1d24';
      botMsg.style.padding = '8px 12px';
      botMsg.style.borderRadius = '12px';
      botMsg.style.alignSelf = 'flex-start';
      botMsg.style.maxWidth = '85%';
      botMsg.innerText = data.reply || 'Thanks for your inquiry. Our support team has logged your message.';
      body.appendChild(botMsg);
      body.scrollTop = body.scrollHeight;
    })
    .catch(function() {
      loadingMsg.remove();
      var errMsg = d.createElement('div');
      errMsg.style.background = '#fef2f2';
      errMsg.style.color = '#dc2626';
      errMsg.style.padding = '8px 12px';
      errMsg.style.borderRadius = '12px';
      errMsg.style.alignSelf = 'flex-start';
      errMsg.innerText = 'Unable to reach customer service server. Please try again.';
      body.appendChild(errMsg);
    });
  }

  sendBtn.onclick = sendMessage;
  input.onkeypress = function(e) {
    if (e.key === 'Enter') sendMessage();
  };
})();
