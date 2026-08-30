const API_BASE_URL = window.location.origin + '/api';

const form = document.getElementById('item-form');
const list = document.getElementById('items-list');

async function fetchItems() {
  try {
    const response = await fetch(`${API_BASE_URL}/items`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Unable to load records');
    }

    renderItems(result.data);
  } catch (error) {
    list.innerHTML = `<li class="empty">Unable to load records right now.</li>`;
    console.error(error);
  }
}

function renderItems(items) {
  if (!items || items.length === 0) {
    list.innerHTML = '<li class="empty">No records available yet.</li>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <li class="item">
          <div class="meta">
            <strong>${item.title}</strong>
            <span class="tag">${item.status.replace('_', ' ')}</span>
          </div>
          <div class="muted">${item.description}</div>
        </li>
      `
    )
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    title: formData.get('title').toString().trim(),
    description: formData.get('description').toString().trim(),
    status: formData.get('status').toString(),
  };

  if (!payload.title || !payload.description) {
    alert('Please enter both title and description.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create record');
    }

    form.reset();
    await fetchItems();
  } catch (error) {
    alert(error.message);
  }
});

fetchItems();
