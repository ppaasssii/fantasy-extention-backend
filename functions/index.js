// The Cloud Functions for Firebase SDK to set up triggers and logging.
const {onSchedule} = require("firebase-functions/v2/scheduler");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
// Dynamisch berechne startsAfter und startsBefore
const now = new Date();
const berlinTimezoneOffset = 60; // Berlin ist in MEZ (+1 Stunde)
now.setMinutes(now.getMinutes() + berlinTimezoneOffset);

const currentWednesday = new Date(now);
currentWednesday.setDate(now.getDate() - now.getDay() + 3);
currentWednesday.setHours(12, 0, 0, 0); // 12:00 Uhr

const nextWednesday = new Date(currentWednesday);
nextWednesday.setDate(currentWednesday.getDate() + 7); // Eine Woche später

const previousWednesday = new Date(currentWednesday);
previousWednesday.setDate(currentWednesday.getDate() - 7);
// Formatierung der Daten als ISO-Zeiten
const startsAfter = previousWednesday.toISOString();
const startsBefore = nextWednesday.toISOString();

exports.fetchSportsData = onSchedule(
    {
      schedule: "0 8-22 * 1,2,3,10,11,12 3",
      // Mittwoch von 8:00 bis 22:00 in Berlin-Zeitzone
      timeZone: "Europe/Berlin",
    },
    async () => {
      try {
        const apiUrl = "https://fetchsportsdataonrequest-6u4svwhcgq-uc.a.run.app";
        console.log(`Triggering fetchSportsDataOnRequest at ${apiUrl}`);

        // HTTP-Request an fetchSportsDataOnRequest senden
        const response = await fetch(apiUrl, {
          method: "POST",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
              `Failed to trigger 
              fetchSportsDataOnRequest: ${response.status} - ${errorText}`,
          );
          return;
        }

        console.log("fetchSportsDataOnRequest triggered successfully.");
      } catch (error) {
        console.error("Error triggering fetchSportsDataOnRequest:", error);
      }
    },
);
/**
   * Fetches, transforms, and stores sports data.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise<void>}
 */
exports.fetchSportsDataOnRequest = functions.https.onRequest(
    async (req, res) => {
      try {
        console.log("Request object:", req);
        console.log("Response object:", res);

        const apiKey1 = "eb432d85906d08bd6e0dd0ea9cebcc8d";
        const apiKey2 = "8beefaad97395c11b68b08cac152eafd";
        const apiUrl = `https://api.sportsgameodds.com/v1/events/?leagueID=NFL&startsAfter=${
          encodeURIComponent(startsAfter)
        }&startsBefore=${encodeURIComponent(startsBefore)}&limit=50`;

        const apiKey = Math.random() < 0.5 ? apiKey1 : apiKey2;
        const response = await fetch(apiUrl, {
          headers: {
            "X-Api-Key": apiKey,
          },
        });

        const data = await response.json();

        // const transformedData = transformData(data);

        const db = admin.database();
        await db.ref("/").set(data);
        res
            .status(200)
            .send(
                "MANUAL REQUEST: Sports data fetched, " +
                "transformed, and stored successfully!",
            );
      } catch (error) {
        console.error("MANUAL REQUEST: Error fetching or storing data:", error);
        res
            .status(500)
            .send("MANUAL REQUEST: Error fetching or storing data.");
      }
    },
);

/**
 * Transforms the fetched sports data.
 * @param {Array} data - The data to transform.
 * @return {Array} The transformed data.

function transformData(data) {
  return data.map((event) => {
    const {eventID, info, leagueID, odds, players, sportID, status, teams} =
        event;
    return {
      eventID,
      seasonWeek: info.seasonWeek,
      leagueID,
      sportID,
      status: status.displayLong,
      startsAt: status.startsAt,
      teams: {
        home: {
          name: teams.home.names.long,
          shortName: teams.home.names.short,
          colors: teams.home.colors,
        },
        away: {
          name: teams.away.names.long,
          shortName: teams.away.names.short,
          colors: teams.away.colors,
        },
      },
      odds: Object.keys(odds).map((oddKey) => {
        const odd = odds[oddKey];
        return {
          betType: odd.betTypeID,
          player: players[odd.playerID].name || "N/A",
          stat: odd.statID,
          overUnder: odd.overUnder,
          odds: odd.odds,
          side: odd.sideID,
        };
      }),
    };
  });
}
 */
