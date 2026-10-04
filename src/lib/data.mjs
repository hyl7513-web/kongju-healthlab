// 데이터 파일(data/*.yaml)을 읽고 형식을 검사한다.
// 오류가 있으면 어느 파일 몇 번째 항목의 무엇이 틀렸는지 한국어로 알려주고 빌드를 멈춘다.
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { z } from 'zod';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const PHOTO_DIR = path.join(ROOT, 'public', 'photos');

// ── 공통 타입 ─────────────────────────────────────
// FAILSAFE 스키마로 읽기 때문에 모든 값이 문자열로 들어온다.
// (그래야 2025.10 이 숫자 2025.1 로 바뀌지 않는다)
const text = z.string().trim();
const opt = z.string().trim().optional().default('');
const req = (label) => z.string({ error: `${label}이(가) 비어 있습니다` }).trim().min(1, `${label}이(가) 비어 있습니다`);
const bool = z
  .enum(['true', 'false', 'yes', 'no', '예', '아니오'], { error: 'true 또는 false 로 적어 주세요' })
  .transform((v) => ['true', 'yes', '예'].includes(v));

/** "2025", "2025.10", "2025.10.24" (구분자 . - / 허용) → {y,m,d} */
export function parseDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})(?:[.\-/](\d{1,2}))?(?:[.\-/](\d{1,2}))?\.?$/);
  if (!m) return undefined; // 형식 오류
  const y = +m[1];
  const mo = m[2] ? +m[2] : null;
  const d = m[3] ? +m[3] : null;
  if (mo !== null && (mo < 1 || mo > 12)) return undefined;
  if (d !== null && (d < 1 || d > 31)) return undefined;
  return { y, m: mo, d };
}
const dateField = (label, required = true) =>
  z
    .string()
    .trim()
    .optional()
    .default('')
    .superRefine((v, ctx) => {
      if (!v) {
        if (required) ctx.addIssue({ code: 'custom', message: `${label}이(가) 비어 있습니다` });
        return;
      }
      if (parseDate(v) === undefined)
        ctx.addIssue({ code: 'custom', message: `${label} "${v}" 형식이 맞지 않습니다 (예: 2025, 2025.10, 2025.10.24)` });
    });

/** 비교용: 기간의 첫날 / 마지막 날 */
export function firstDay(p) {
  return new Date(p.y, (p.m ?? 1) - 1, p.d ?? 1);
}
export function lastDay(p) {
  if (p.d) return new Date(p.y, p.m - 1, p.d);
  if (p.m) return new Date(p.y, p.m, 0);
  return new Date(p.y, 11, 31);
}
export function formatDate(raw) {
  const p = parseDate(raw);
  if (!p) return '';
  return [p.y, p.m && String(p.m).padStart(2, '0'), p.d && String(p.d).padStart(2, '0')].filter(Boolean).join('.');
}

const periodItem = z.object({ period: opt, text: req('내용') });

// ── 파일별 스키마 ────────────────────────────────
const siteSchema = z.object({
  name_ko: req('연구실 이름'),
  name_en: req('영문 이름'),
  university: req('대학명'),
  department: req('학과명'),
  college: opt,
  slogan: opt,
  intro: opt,
  contact: z.object({ address: opt, email: opt, tel: opt, fax: opt }),
  links: z.array(z.object({ label: req('링크 이름'), url: req('링크 주소') })).default([]),
  courses: z
    .array(z.object({ term: req('학기'), undergrad: z.array(text).default([]), graduate: z.array(text).default([]) }))
    .default([]),
  recruit: z
    .object({ show: bool.default(false), title: req('모집 제목'), details: z.array(text).default([]), contact: opt })
    .optional(),
  research_areas: z
    .array(
      z.object({
        title: req('연구 분야 이름'),
        keywords: opt,
        icon: z.enum(['pill', 'virus', 'person', 'check', 'chart', 'book'], { error: 'icon 은 pill, virus, person, check, chart, book 중 하나' }).default('book'),
      }),
    )
    .default([]),
});

const professorSchema = z.object({
  name: req('이름'),
  name_en: opt,
  position: req('직위'),
  photo: opt,
  email: opt,
  tel: opt,
  fax: opt,
  highlights: z.array(text).default([]),
  education: z.array(periodItem).default([]),
  career: z.array(periodItem).default([]),
  awards: z.array(z.object({ year: opt, text: req('내용') })).default([]),
});

const memberSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/, 'id 는 영문 소문자, 숫자, 하이픈(-)만 쓸 수 있습니다'),
  name: req('이름'),
  name_en: opt,
  status: z.enum(['재학', '졸업'], { error: 'status 는 "재학" 또는 "졸업"이어야 합니다' }),
  course: req('과정'),
  note: opt,
  graduated: opt,
  current: opt,
  email: opt,
  email_public: bool.default(false),
  photo: opt,
  cv: z
    .object({
      education: z.array(periodItem).default([]),
      interests: z.array(text).default([]),
      work: z.array(periodItem).default([]),
      projects: z.array(periodItem).default([]),
      publications: z.array(periodItem).default([]),
      awards: z.array(periodItem).default([]),
      skills: z.array(text).default([]),
    })
    .optional(),
});

const paperSchema = z.object({
  year: z.string().trim().regex(/^\d{4}$/, 'year 는 2025 처럼 네 자리 숫자여야 합니다'),
  scope: z.enum(['국제', '국내'], { error: 'scope 는 "국제" 또는 "국내"여야 합니다' }),
  authors: req('저자'),
  title: req('제목'),
  journal: req('학술지'),
  citation: opt,
  role: opt,
  url: opt,
});

const projectSchema = z
  .object({
    title: req('과제명'),
    start: dateField('시작일'),
    end: dateField('종료일', false),
    role: opt,
    funder: opt,
  })
  .superRefine((p, ctx) => {
    const s = parseDate(p.start);
    const e = parseDate(p.end);
    if (s && e && firstDay(s) > lastDay(e))
      ctx.addIssue({ code: 'custom', path: ['end'], message: `종료일(${p.end})이 시작일(${p.start})보다 앞섭니다` });
  });

const newsSchema = z.object({
  date: dateField('날짜'),
  category: z.enum(['언론', '수상', '공지'], { error: 'category 는 "언론", "수상", "공지" 중 하나여야 합니다' }),
  title: req('제목'),
  source: opt,
  url: opt,
  body: opt,
});

// ── 읽기·검사 ────────────────────────────────────
function readYaml(file) {
  const full = path.join(DATA_DIR, file);
  const src = fs.readFileSync(full, 'utf8');
  try {
    return yaml.load(src, { schema: yaml.FAILSAFE_SCHEMA, filename: file });
  } catch (e) {
    // 들여쓰기·따옴표 오류 등
    throw new DataError([`[${file}] 파일 문법 오류 (${e.mark ? `${e.mark.line + 1}번째 줄` : '위치 미상'}): ${e.reason || e.message}`]);
  }
}

export class DataError extends Error {
  constructor(problems) {
    super('\n' + problems.map((p) => '  ✗ ' + p).join('\n'));
    this.problems = problems;
  }
}

function describe(file, item, i) {
  const label = item && typeof item === 'object' ? item.name || item.title || item.id : '';
  return `[${file}] ${i + 1}번째 항목${label ? ` (${String(label).slice(0, 30)})` : ''}`;
}

function check(file, schema, { list = false } = {}) {
  const raw = readYaml(file);
  const problems = [];
  if (list) {
    if (!Array.isArray(raw)) return { problems: [`[${file}] 목록 형식(- 로 시작)이어야 합니다`] };
    const out = [];
    raw.forEach((item, i) => {
      const r = schema.safeParse(item);
      if (r.success) out.push(r.data);
      else
        for (const iss of r.error.issues)
          problems.push(`${describe(file, item, i)} ${iss.path.join('.') || ''}: ${iss.message}`.replace(' :', ':'));
    });
    return { data: out, problems };
  }
  const r = schema.safeParse(raw);
  if (!r.success) for (const iss of r.error.issues) problems.push(`[${file}] ${iss.path.join('.')}: ${iss.message}`);
  return { data: r.success ? r.data : null, problems };
}

let cache;
export function loadAll() {
  if (cache) return cache;
  const results = {
    site: check('site.yaml', siteSchema),
    professor: check('professor.yaml', professorSchema),
    members: check('members.yaml', memberSchema, { list: true }),
    papers: check('papers.yaml', paperSchema, { list: true }),
    projects: check('projects.yaml', projectSchema, { list: true }),
    news: check('news.yaml', newsSchema, { list: true }),
  };
  const problems = Object.values(results).flatMap((r) => r.problems);

  // 추가 검사: id 중복, 사진 파일 존재
  const seen = new Set();
  for (const m of results.members.data ?? []) {
    if (seen.has(m.id)) problems.push(`[members.yaml] id "${m.id}"가 두 번 이상 쓰였습니다`);
    seen.add(m.id);
  }
  const photos = [
    ...(results.members.data ?? []).map((m) => ['members.yaml', m.name, m.photo]),
    ['professor.yaml', results.professor.data?.name, results.professor.data?.photo],
  ];
  for (const [file, who, photo] of photos)
    if (photo && !fs.existsSync(path.join(PHOTO_DIR, photo)))
      problems.push(`[${file}] ${who}: 사진 "${photo}"이(가) public/photos/ 폴더에 없습니다`);

  if (problems.length) throw new DataError(problems);
  cache = Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v.data]));
  return cache;
}

// ── 화면용 가공 ──────────────────────────────────
export function projectStatus(p, today = new Date()) {
  const e = parseDate(p.end);
  if (!e) return '진행';
  return lastDay(e) < today ? '종료' : '진행';
}
export function projectPeriod(p) {
  return [formatDate(p.start), formatDate(p.end)].filter(Boolean).join(' – ');
}
export function sortByDateDesc(items, key) {
  return [...items].sort((a, b) => firstDay(parseDate(b[key])) - firstDay(parseDate(a[key])));
}
