const token = "0bf320a11fb24af9bfe6a705bb60cb32";

async function run() {
  const date = "2026-06-30";
  const url = `https://api.football-data.org/v4/matches?dateFrom=2026-06-30&dateTo=2026-07-01`;
  try {
    const res = await fetch(url, { headers: { "X-Auth-Token": token } });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}
run();
