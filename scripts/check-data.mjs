// 데이터 파일 검사: npm run check-data
// 배포 전에 자동으로 실행되며, 오류가 있으면 배포하지 않는다.
import { loadAll, DataError } from '../src/lib/data.mjs';

try {
  const d = loadAll();
  console.log(
    `✓ 데이터 검사 통과 — 구성원 ${d.members.length}명, 논문 ${d.papers.length}편, 과제 ${d.projects.length}건, 소식 ${d.news.length}건`,
  );
} catch (e) {
  if (e instanceof DataError) {
    console.error('\n데이터 파일에 고쳐야 할 부분이 있습니다. 아래 내용을 확인해 주세요:');
    console.error(e.message + '\n');
    process.exit(1);
  }
  throw e;
}
