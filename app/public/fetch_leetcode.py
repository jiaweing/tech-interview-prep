#!/usr/bin/env python3
"""Download LeetCode's public problem list (titles, links, difficulty, topic tags, acceptance; no statements)
into app/public/leetcode-raw.json. Then run leetcode_build.py and rebuild the app."""
import json, os, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
Q = ('query q($skip:Int,$limit:Int){problemsetQuestionList: questionList(categorySlug:"", limit:$limit, skip:$skip, filters:{})'
     '{ total: totalNum questions: data { frontendQuestionId: questionFrontendId title titleSlug difficulty isPaidOnly topicTags { slug } acRate } } }')

def page(skip):
    body = json.dumps({'query': Q, 'variables': {'skip': skip, 'limit': 100}}).encode()
    req = urllib.request.Request('https://leetcode.com/graphql', data=body, headers={
        'Content-Type': 'application/json', 'Referer': 'https://leetcode.com/problemset/', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)['data']['problemsetQuestionList']

out, skip = [], 0
while True:
    d = page(skip)   # the API returns at most 100 per page
    out += d['questions']; skip += 100
    print(len(out), 'of', d['total'])
    if skip >= d['total'] or not d['questions']: break
    time.sleep(0.6)
json.dump(out, open(os.path.join(HERE, 'leetcode-raw.json'), 'w'))
print('saved', len(out), 'problems to leetcode-raw.json')
