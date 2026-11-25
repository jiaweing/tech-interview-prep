function viewTestDay(page) {
  page.classList.add('narrow');
  const card = (t, when, items) => '<section class="td"><h2>' + t + ' <span class="muted" style="font-weight:400;font-size:13px">' + when + '</span></h2><ol>' + items.map(x => '<li>' + x + '</li>').join('') + '</ol></section>';
  page.innerHTML = '<h1>Interview day</h1>' +
    '<div class="tdfacts">' + [['3-5 rounds', 'coding, system design, behavioural'], ['45-60 min each', 'often back to back'], ['Talk it through', 'silence reads as stuck'], ['Owners win', 'say "I decided", show impact']].map(f => '<div><b>' + f[0] + '</b><span>' + f[1] + '</span></div>').join('') + '</div>' +
    card('Behavioural / deep dive', '45-60 min', [
      'Bring 1–2 projects you owned. Open with a 3-minute version: problem, users, what <b>you</b> built, impact with a number.',
      'For each big decision, name the option you rejected and why.',
      'Have a setback, a stakeholder clash, and feedback that changed your plan ready as 2-minute stories.',
      'Say what you would do differently. Most rubrics ask for it.']) +
    card('Live coding', '45-60 min', [
      'Restate the task and ask one or two clarifying questions before typing.',
      'Get a simple correct version running first, with the given example as a test.',
      'Think out loud. Name things clearly. Keep functions small.',
      'When it passes, offer the next step yourself: edge cases, speed, a new rule.']) +
    card('System design', '45-60 min', [
      'Requirements and users first, then rough numbers.',
      'Draw the request path, then go deep on one hard part.',
      'For an AI product, cover evals, cost per user, model latency, fallbacks and access control.',
      'Say how you would ship a thin version to real users fast, and what you would measure.']);
