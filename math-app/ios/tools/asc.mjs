// TestFlight 베타그룹에 최신 빌드를 붙인다.
// 빌드는 **번호가 아니라 업로드 시각**으로 고른다 — manageAppVersionAndBuildNumber가
// 번호를 자동으로 매겨서, 번호로 고르면 옛 빌드를 집는 사고가 난다(9/10에 두 번).
import { createSign } from 'node:crypto'
import { readFileSync } from 'node:fs'

const KEY_ID = '7U49JQRU3Q'
const ISSUER = readFileSync(`${process.env.HOME}/.appstoreconnect/issuer_id`, 'utf8').trim()
const KEY = readFileSync(`${process.env.HOME}/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8`, 'utf8')

const since = Number(process.argv[2] || 0)

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
function token() {
  const now = Math.floor(Date.now() / 1000)
  const head = b64({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })
  const body = b64({ iss: ISSUER, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' })
  const s = createSign('SHA256'); s.update(`${head}.${body}`); s.end()
  const der = s.sign({ key: KEY, dsaEncoding: 'ieee-p1363' })
  return `${head}.${body}.${der.toString('base64url')}`
}
const api = async (path, init = {}) => {
  const r = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    ...init, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  if (!r.ok) throw new Error(`${r.status} ${path}: ${(await r.text()).slice(0, 300)}`)
  return r.status === 204 ? null : r.json()
}

const apps = await api('/v1/apps?limit=200')
const app = apps.data.find((a) => a.attributes.bundleId === 'com.slstudio.duth')
const builds = await api(`/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=20`)
// 업로드 시각이 기준 이후인 것 중 가장 최근. 미래 컷오프를 주면 아무것도 안 걸리므로
// 넉넉히 뒤로 잡아 부른다.
const cand = builds.data.filter((b) => Date.parse(b.attributes.uploadedDate) >= since)
const b = cand[0]
if (!b) { console.log('  기준 이후 새 빌드 없음'); process.exit(0) }
const state = b.attributes.processingState
console.log(`  최신 ${b.attributes.version} · ${state} · ` +
  new Date(b.attributes.uploadedDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) + ' PT')
if (state !== 'VALID') { console.log('  아직 처리 중'); process.exit(1) }

const groups = await api(`/v1/apps/${app.id}/betaGroups?limit=50`)
const g = groups.data.find((x) => x.attributes.isInternalGroup) || groups.data[0]
await api(`/v1/betaGroups/${g.id}/relationships/builds`, {
  method: 'POST', body: JSON.stringify({ data: [{ type: 'builds', id: b.id }] }),
}).catch((e) => { if (!String(e).includes('409')) throw e })

// **붙였다고 말하기 전에 확인한다.** POST가 204를 줘도 실제로 안 붙는 경우를 가정하고
// 그룹의 빌드 목록을 다시 읽는다 — 9/18에 "배정 완료"를 믿고 한참 엉뚱한 데를 팠다.
// 이 목록에는 sort를 못 쓴다(400 PARAMETER_ERROR.ILLEGAL). 그때 그 400을 catch가
// 삼켜서 "그룹에 빌드 없음"이라는 거짓 진단이 나왔다.
const after = await api(`/v1/betaGroups/${g.id}/builds?limit=20`)
const on = after.data.some((x) => x.id === b.id)
console.log(`\n빌드 ${b.attributes.version} ${on ? '배정 완료' : '★ 배정 실패 — 그룹에 없음'}`
  + ` · 그룹 "${g.attributes.name}"에 ${after.data.length}개`)
if (!on) process.exit(1)
