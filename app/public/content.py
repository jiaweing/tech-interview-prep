"""Public edition data: generic rounds instead of one candidate's loop. Imported by build.py --public."""
import json, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))

STAGES = [
    {'when': 'Screen · 30-45 min', 'title': 'Coding screen', 'what': 'One or two LeetCode-style problems, easy to medium. Talk, code, test.', 'href': 'leetcode'},
    {'when': 'Onsite · 45-60 min', 'title': 'Live coding', 'what': 'A practical task you extend live. Clarify, get it working, test, then add the next rule.', 'href': 'problems'},
    {'when': 'Onsite · 45-60 min', 'title': 'System design', 'what': 'Requirements, numbers, API, data model, then one deep dive and the trade-offs.', 'href': 'sd'},
    {'when': 'Onsite · 45-60 min', 'title': 'Behavioural / deep dive', 'what': 'One or two projects you owned: decisions, setbacks, stakeholders, impact.', 'href': 'dd'},
]
TIPS = [
    'Restate the task and ask about edge cases before typing. Pin down the exact rule and the input sizes.',
    'Write the simplest correct version first, with a test for the given example, then improve it.',
    'Make rules data, not if-chains. The interviewer will add a rule; it should land in one place.',
    'Name things clearly and keep functions small: interviewers read your code, not just the test result.',
    'Think out loud. In live coding, silence reads as stuck even when you are not.',
    'When the base task passes, offer the next extension yourself.',
]

DD_INTRO = ('<p>The <b>project deep dive</b> (often called the behavioural round) is usually 45-60 minutes. You walk through one or two '
            'projects, focusing on your own contributions, your technical approach, the key decisions and the impact on users. Then the '
            'interviewer digs: how you handled setbacks, managed stakeholders, used feedback and changed course. Bring specific examples, '
            'including what went wrong, what you learned and what you would do differently.</p>'
            '<p>The panel is listening for an owner, not a ticket-taker. Say "I decided" and "I measured", show what happened after launch, '
            'and know the numbers: users, latency, cost, error rate. Fill in the worksheet below for your own projects; the mock interviewer '
            'reads it to ask follow-ups about what you actually did.</p>')
DD_PLAN_FIX = {
    'Who you are, what you build, and why an AI product lab.': 'Who you are, what you build, and why this team.',
    'Ask 2-3 sharp questions about pilots, evals, costs and closure.': 'Ask 2-3 sharp questions about how the team works and how success is judged.',
}
ASK_THEM = [
    'What does the first three months look like for someone in this role?',
    'How do you decide what to build next, and who has a say?',
    'What is the last thing that broke in production, and what changed afterwards?',
    'How is quality checked before and after a release: tests, reviews, metrics?',
    'Where does the team use AI tools today, and where have you pulled back?',
    'What would make someone in this role clearly successful after six months?',
]
# phrases in the shared question bank that were written for one specific team
GENERIC = [
    (r',? which GRL pilots must do', ', which owners are expected to do'),
    (r',? as GRL pilots are expected to', ''),
    (r',? as GRL pilots must', ''),
    (r',? which the GRL posting asks for explicitly', ''),
    (r',? which GRL pilots carry, including model tokens', ', including model tokens'),
    (r", part of a GRL pilot's job", ''),
    (r' in a lab that keeps changing tools', ' when tools keep changing'),
    (r'which the invitation asks for directly', 'which most rubrics ask for'),
    (r'the invitation asks for', 'most rubrics ask for'),
    (r'GovTech|Giant Robots Labs|GRL', 'the team'),
]
def generic(s):
    for a, b in GENERIC: s = re.sub(a, b, s)
    return s

def deepdive(dd):
    dd = json.loads(generic(json.dumps(dd, ensure_ascii=False)))
    dd['intro'] = DD_INTRO
    for p in dd.get('plan', []):
        for a, b in DD_PLAN_FIX.items(): p['do'] = p['do'].replace(a, b)
    dd['ask_them'] = ASK_THEM
    return dd

def gt_data(gt):
    return dict(gt, stages=STAGES, tips=TIPS)

def packs(problems, private=None):
    """Company packs. A pack lists rounds and reported tasks with where they were reported.
    A private overlay (build.py --private DIR) can add packs or replace one with the same id (DIR/packs/*.json)
    and leave packs out (exclude_packs in DIR/config.json)."""
    files = {os.path.basename(f): f for f in glob.glob(os.path.join(HERE, 'packs', '*.json'))}
    if private:
        files.update({os.path.basename(f): f for f in glob.glob(os.path.join(private['dir'], 'packs', '*.json'))})
        for x in private.get('exclude_packs', []): files.pop(x + '.json', None)
    out = []
    for f in sorted(files.values()):
        P = json.load(open(f, encoding='utf-8'))
        if P.get('problems_from') == 'govtech':
            ids = [p['id'] for p in problems if p.get('govtech')]
            P['reported'] = [{'problem': p['id'], 'round': p['govtech'].get('round'), 'tag': p['govtech'].get('tag'), 'note': p['govtech'].get('source', '')}
                             for p in problems if p.get('govtech')]
        out.append(P)
    return out
