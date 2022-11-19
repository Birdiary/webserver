const language = {
    en: {
        navbar: {
            create: "Create Station",
            more:
                "Learn more about our project",
            overview: "Map",
            validation: "Validation"
        },

        map: {
            stationName: "Name of the station: ",
            inspect: "Inspect station",
            lastEnvironment: "Last measurement: ",
            lastMovement: "Last Bird: ",
            statistics: "Show statistics"
        },
        legend: {
            head: "Legend",
            description: "The symbols represent the last 24 hours",
            symbol: "Symbol",
            meaning: "Meaning",
            black: "No environmental data",
            green: "Environmental data",
            bird: "Environmental data and bird"
        },
        dashboard: {
            header:  "Top 10 bird species, that were detected:"
        },
        share: {
            button: "Share observation",
            copy: "Copy link"
        },
        stations: {
            infospecies: "A video consists of several images. For one second, we store 30 images. Our species recognition algorithm analyzes every 10th image from the video. For the image the species are determined e.g. Pyrhulla pyrhulla with 70% for the first analyzed image. Then for the second one Cardinalis Cardinal with a probability of 60% and so on. At the end the highest probabilities for each species are determined and stored. So it can happen, as in this example, that a total of over 100% is displayed. \Our database has the German names for most of the German birds. If there is no German name next to the destination, this can be an indication that the bird is not normally found in Germany. Behind the German name is a link to the website of NABU, which gives more information about the bird. We have not been able to check all links. Therefore it may happen that some links do not work ",
            infocount: "Here you will find an overview of the counted birds yesterday and today. The bird with the highest determination is counted. Our algorithm cannot detect at this time if a bird is visiting the station for the second time. The bird will be counted again.\n Our database has the German names for most of the German birds. If there is no German name next to the destination, this can be an indication that the bird is not normally found in Germany. Behind the German name is a link to the website of NABU, which gives more information about the bird. We have not been able to check all links. Therefore it may happen that some links do not work ",
            infoenvironment: "The measured values are measured by a DHT humidity and temperature sensor. When the sensor is read out for the first time, it may happen that wrong values are read out. Therefore, measurements where the temperature is below -35°C are excluded",
            audio: "Audio:",
            weight: "Weight:",
            species: "Detected species: ",
            wait1: "The video is being processed and the species will be determined! ",
            wait2: "Please wait a brief moment and then click the refresh button.",
            noData1: "So far, no bird has been detected",
            noData2: "No environmental data has been collected yet",
            environment: "Environmental sensors",
            temperature: "Temperature in °C: ",
            humidity: "Humidity in %: ",
            birdsCount: "Counted Birds:",
            yesterday: "Yesterday",
            today: "Today",
            search: "Species to search for",
            search2: "Search for birds",
            day: "Day to search for",
            notFound: "The station was not found, you will be redirected to the home screen in 5 seconds:"
        },
        table: {
            noBird: "No bird was detected on the video",
            species: "Species:",
            name: "German name",
            propability: "Propability",
            noBirdDay: "No bird was captured on this day",
            count: "Count",
            validation: "Validation",
            search: "Show species"
        },
        createStation: {
            title: "Create Station:",
            name: "Name of the station",
            mail: "Mail addresses to be notified. Confirm input with Enter",
            mailHelper: "Confirm mail address with Enter",
            position: "Location of the station (enter the coordinates or move the marker on the map)",
            dataPrivacy: "You must agree to the privacy policy",
            finshed: "The station was successfully created and has the ID:",
            senseboxCreated: "A senseBox on the openSenseMap was created.",
            senseboxNotCreated: "NO senseBox has been created.",
            creating: "The station is being created",
            running: "Creating a station",
            overview: "Go to the overview",
            viewStation: "Inspect Station",
            dataPrivacyText: "I accept that the data collected here in this form and by the station will be published on our website. The mail addresses will not be published, but only used to notify you. All data can be deleted or modified upon request.",
            opensensemapText: "I agree that the environmental data (air temperature and humidity) and the location of my station will also be published on opensensemap.org. The senseBox created, shall be managed by the operators of the website wiediversistmeingarten.org."
        },
        validation: {
            send: "Send Validation",
            noBird: "No Bird in Video",
            next: "Go to next Bird",
            form: "Bird in video"
        }

    },
    de: {
        navbar: {
            create: "Erstelle Station",
            more:
                "Erfahre mehr über unser Projekt",
            overview: "Übersichtskarte",
            validation: "Validierung"
        },

        map: {
            stationame: "Name der Station",
            inspect: "Beobachte Station",
            lastEnvironment: "Letzte Umweltmessung: ",
            lastMovement: "Letzter Vogel: ",
            statistics: "Zeige Statistiken"
        },
        legend: {
            head: "Legende",
            description: "Die Symbole repräsentieren die letzten 24 Stunden",
            symbol: "Symbol",
            meaning: "Bedeutung",
            black: "Keine Umweltdaten",
            green: "Umweltdaten",
            bird: "Umweltdaten und Vogel"
        },
        dashboard: {
            header:  "Top 10 Vogelarten, die an den Stationen erkannt wurden:"
        },
        share: {
            button: "Teile Beobachtung",
            copy: "Kopiere Link"
        },
        stations: {
            infospecies: "Ein Video besteht aus mehreren Bilder. Für eine Sekunde werden bei uns 30 Bilder gespeichert. Unser Artenerkennungsalgorithmus analysiert jedes 10. Bild aus dem Video. Für das Bild werden die Arten bestimmt z.B. Pyrhulla pyrhulla mit 70% für das Erste analysierte Bild. Für das zweite dann Cardinalis Cardinal mit einer Wahrscheinlichkeit von 60% usw. Am Ende werden die höchsten Wahrscheinlichkeiten für jede Art bestimmt und gespeichert. So kann es vorkommen, wie in diesem Beispiel, dass Insgesamt über 100% angezeigt werden. \n Unsere Datenbank besitzt die Deutschen Namen für die meisten deutschen Vögel. Wenn neben der Bestimmung kein Deutscher Name steht, kann dies ein Indiez dafür sein, dass der Vogel normalerweise nicht in Deutschland vorkommt. Hinter dem Deutschen Namen ist die Website vom NABU verlinkt, welche weitere Informationen über den Vogel liefert. Wir haben nicht alle Links überprüfen können. Daher kann es vorkommen, dass einige Links nicht funktionieren ",
            infocount: "Hier findet Ihr eine Übersicht über die gezählten Vögel gestern und heute. Hierbei wird jeweils der Vogel mit der höchsten Bestimmung gezählt. Unser Algorithmus kann zum jetzigen Zeitpunkt nicht erkennen, ob ein Vogel zum zweiten mal die Station besucht. Der Vogel wird erneut gezählt.\n Unsere Datenbank besitzt die Deutschen Namen für die meisten deutschen Vögel. Wenn neben der Bestimmung kein Deutscher Name steht, kann dies ein Indiez dafür sein, dass der Vogel normalerweise nicht in Deutschland vorkommt. Hinter dem Deutschen Namen ist die Website vom NABU verlinkt, welche weitere Informationen über den Vogel liefert. Wir haben nicht alle Links überprüfen können. Daher kann es vorkommen, dass einige Links nicht funktionieren ",
            infoenvironment: "Die gemssennen Werte werden von einem DHT Luftfeuchte und Temperatur Sensor gemessen. Wenn der Sensor zum ersten mal ausgelesen wird, kann es vorkommen, dass falsche Werte ausgelesen werden. Daher werden Messungen, bei denen die Temperatur unter -35°C beträgt, ausgeschlossen.",
            audio: "Audio:",
            weight: "Gewicht:",
            species: "Erkannte Arten: ",
            wait1: "Das Video wird gerade verabeitet und die Art bestimmt! ",
            wait2: "Bitte warte einen kurzen Moment und klicke dann auf den Refresh Button",
            noData1: "Bisher wurde noch kein Vogel erkannt",
            noData2: "Bisher wurden noch keine Umweltdaten gesammelt",
            environment: "Umweltsensoren",
            temperature: "Temperatur in °C: ",
            humidity: "Luftfeuchte in %: ",
            birdsCount: "Gezählte Vögel:",
            yesterday: "Gestern",
            today: "Heute",
            search: "Zu suchende Art",
            search2: "Durchsuche Vögel",
            day: "Zu suchender Tag",
            notFound: "Die Station wurde nicht gefunden, du wirst in 5 Sekunden auf die Home Seite geleitet"
        },
        table: {
            noBird: "Es wurde kein Vogel auf dem Video erkannt",
            species: "Art",
            name: "Deutscher Name",
            propability: "Wahrscheinlichkeit",
            noBirdDay: "An diesem Tag wurde kein Vogel bestimmt",
            count: "Anzahl",
            validation: "Validierung", 
            search: "Zeige Art"
        },
        createStation: {
            title: "Erstelle eine Station:",
            name: "Name der Station",
            mail: "Zu Benachrichtigende Mail Adressen. Eingabe mit Enter bestätigen",
            mailHelper: "Mail Adresse mit Enter bestätigen",
            position: "Standort der Station (Gib die Koordinaten ein oder bewege den Marker in der Karte)",
            dataPrivacy: "Ihr müsst der Datenschutzerklärung zustimmen",
            finshed: "Die Station wurde erfolgreich erstellt und hat die ID:",
            senseboxCreated: "Eine Sensebox auf der OpenSenseMap wurde erstellt.",
            senseboxNotCreated: "Es wurde KEINE Sensebox erstellt.",
            creating: "Die Station wird gerade erstellt",
            running: "Erstellen einer Station",
            overview: "Gehe zum Überblick",
            viewStation: "Beobachte Station",
            dataPrivacyText: "Ich akzeptiere, dass die hier bei diesem Formular und durch die Station gesammelten Daten auf unserer Website veröffentlicht werden. Die Mail-Adressen werden nicht veröffentlicht, sondern nur genutzt um euch zu benachrichtigen. Alle Daten können auf Anfrage gelöscht oder geändert werden.",
            opensensemapText: "Ich stimme zu, dass die Umweltdaten (Lufttemperatur und -feuchte) und der Standort meiner Station auch auf opensensemap.org veröffentlicht werden. Die dort erstellte senseBox soll von den Betreibern der Website wiediversistmeingarten.org verwaltet werden."
        },
        validation: {
            send: "Sende Validierung",
            noBird: "Kein Vogel im Video",
            next: "Gehen zum nächsten Vogel",
            form: "Vogel im Video"
        }
    }
};

export default language;