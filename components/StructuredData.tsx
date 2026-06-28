import { getScores, type ScoreStatus } from "@/lib/scores";
import { SITE_URL } from "@/lib/site";

function eventStatus(status: ScoreStatus) {
  return status === "FT" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled";
}

export default async function StructuredData() {
  const { games } = await getScores();

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: "Who is the GOAT? Ronaldo vs Messi — Live Vote",
    description:
      "Live fan vote — Cristiano Ronaldo vs Lionel Messi. Cast your vote for football's greatest of all time during FIFA World Cup 2026.",
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "GOAT Vote" },
    about: [
      {
        "@type": "Person",
        name: "Cristiano Ronaldo",
        alternateName: "CR7",
        nationality: "Portuguese",
        jobTitle: "Professional Footballer",
        url: "https://en.wikipedia.org/wiki/Cristiano_Ronaldo",
      },
      {
        "@type": "Person",
        name: "Lionel Messi",
        alternateName: "Leo Messi",
        nationality: "Argentine",
        jobTitle: "Professional Footballer",
        url: "https://en.wikipedia.org/wiki/Lionel_Messi",
      },
    ],
    mainEntity: {
      "@type": "Question",
      name: "Who is the football GOAT — Cristiano Ronaldo or Lionel Messi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cast your live vote and see what fans around the world think during FIFA World Cup 2026.",
      },
    },
  };

  const scoresLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Soccer Scores Today — FIFA World Cup 2026",
    numberOfItems: games.length,
    itemListElement: games.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SportsEvent",
        name: `${game.home} vs ${game.away}`,
        sport: "Soccer",
        eventStatus: eventStatus(game.status),
        ...(game.kickoff ? { startDate: game.kickoff } : {}),
        superEvent: { "@type": "SportsEvent", name: game.league },
        homeTeam: { "@type": "SportsTeam", name: game.home },
        awayTeam: { "@type": "SportsTeam", name: game.away },
        ...(game.homeScore !== null && game.awayScore !== null
          ? { description: `${game.home} ${game.homeScore}–${game.awayScore} ${game.away} (${game.status})` }
          : {}),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scoresLd) }} />
    </>
  );
}
