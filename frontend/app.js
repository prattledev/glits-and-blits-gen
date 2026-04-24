let toneType = 'glits';

const toneButtons  = document.querySelectorAll('.tone-btn');
const slider       = document.getElementById('repetitions');
const sliderValue  = document.getElementById('slider-value');
const generateBtn  = document.getElementById('generate-btn');
const status       = document.getElementById('status');

function updateSliderLabel() {
  const reps = Number(slider.value);
  const dur  = toneType === 'glits'
    ? `${reps * 4} s`
    : `${(reps * 13.4).toFixed(1)} s`;
  sliderValue.textContent = `×${reps} · ${dur}`;
}

toneButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toneType = btn.dataset.tone;
    toneButtons.forEach(b => b.classList.toggle('active', b === btn));
    updateSliderLabel();
  });
});

slider.addEventListener('input', updateSliderLabel);

generateBtn.addEventListener('click', async () => {
  generateBtn.disabled    = true;
  generateBtn.textContent = 'Generating…';
  status.textContent      = '';
  status.className        = 'status';

  try {
    const res = await fetch('/api/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tone_type: toneType, repetitions: Number(slider.value) }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const blob        = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match       = disposition.match(/filename="([^"]+)"/);
    const filename    = match?.[1] ?? 'tone.wav';

    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    status.textContent = `↓ ${filename}`;
    status.className   = 'status ok';
  } catch (e) {
    status.textContent = e.message;
    status.className   = 'status error';
  } finally {
    generateBtn.disabled    = false;
    generateBtn.textContent = 'Generate & Download';
  }
});
