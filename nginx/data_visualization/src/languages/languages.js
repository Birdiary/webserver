const language = {
    en: {
        navbar: {
            create: "Create Station",
            more:
                "Learn more about our project",
            overview: "Map",
            validation: "Validation",
            statistics: "Statistics"
        },

        map: {
            stationName: "Name of the station: ",
            inspect: "Inspect station",
            lastEnvironment: "Last measurement: ",
            lastMovement: "Last Bird: ",
            statistics: "Show statistics",
            level: "Silo level: "
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
            pressure: "Air pressure in hPa: ",
            illuminance: "Illuminance in Lux: ",
            humidity: "Humidity in %: ",
            birdsCount: "Counted Birds:",
            yesterday: "Yesterday",
            today: "Today",
            search: "Species to search for",
            search2: "Search for birds",
            day: "Day to search for",
            notFound: "The station was not found, you will be redirected to the home screen in 5 seconds:",
            exhibitInfo: "Notice: ",
            exhibitInfo2: "This movement was originally recorded by the station ",
            exhibitInfo3: " and serves here as an example recording."       },
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
            finished: "The station was successfully created and has the ID:",
            senseboxCreated: "A senseBox on the openSenseMap was created.",
            senseboxNotCreated: "No senseBox has been created.",
            creating: "The station is being created",
            running: "Creating a station",
            overview: "Go to the overview",
            viewStation: "Inspect Station",
            dataPrivacyText: "I accept that the data collected here in this form and by the station will be published on our website. The mail addresses will not be published, but only used to notify you. All data can be deleted or modified upon request.",
            opensensemapText: "I agree that the environmental data (air temperature and humidity) and the location of my station will also be published on opensensemap.org. The senseBox created, shall be managed by the operators of the website wiediversistmeingarten.org.",
            download: "Start download of the image ",
            ssid: "Enter W-Lan SSID to configure WLAN automatically",
            pwd: "Enter W-Lan Password to configure WLAN automatically",
            createImage: "Create an image that can be installed directly on the SSD card.",
            creatingImage: "The image is being created. If this takes longer than 5 minutes, please try to restart the image creation several times. If after 15 minutes no image could be created, please download the image from the following link. But be aware that you then have to configure the WLAN and the station settings (station_id) yourself, please see the instructions: ",
            stationConfig: "Configuration of the stations",
            stationConfigText: "Here parameters can be set via the station, such as the W-Lan settings or the rotation of the camera. All parameters can also be set later on the station, but here a user-friendly input is enabled. The W-Lan data is sent to the server in double encrypted form and is only read out there.",
            rotation: "Here you can set the rotation for the camera. If the cable looks upwards enter 180, if to the right 90",
            time: "Time interval in minutes by which environmental data are to be measured",
            notifications: "Do you want to be notified by mail for each bird",
            submit: "Create Station",
            numberVisualExamples: "Number of examples to be displayed on the ward and recorded by other stations.",
            type: "Type of the Station",
            typeHelper: 'There is a choice of 3 possible types. The normal station is the "Observer" type, which permanently records data. The "Test" type means that the station is not shown on the map and detections are automatically deleted. This is suitable for development purposes. The type "Exhibit" also automatically deletes the recorded videos. However, this is displayed on the map. In addition, examples of other stations can be displayed here.',
            deleteMinutes: "Time interval in minutes after which the recorded videos are deleted.",
            detectionThreshold: "Necessary probability from which the detections are stored by the AI.",
            detectionThresholdHelper: "Example: At 0.3, a detection is saved when the model claims with the probability of 30% that the detected bird on the video is a blue tit."        
        },
        validation: {
            send: "Send Validation",
            noBird: "No Bird in Video",
            next: "Go to next Bird",
            form: "Bird in video"
        },
        statistics: {
            infoSum: "To calculate these statistics, the species that was determined with the highest probability by the image recognition model is added up. Therefore, it can also happen that species are displayed that do not occur in German gardens.",
            infoValidation: "This statistic shows how many times a particular species has been validated. Therefore, it does not indicate how many times the bird was at the station. The number of validations also includes validations if no bird was detected on the video, but these are not shown in the view below. Feel free to try improving the stats directly by validating videos from your station. ",
            infoSpecialBirds: "Here we show you species that have actually been detected at one of our stations before. Only detections are taken where the probability of the species, output from the Ki, are above 85%. The validations are not included.",            showMore: "Zeige mehr Statistiken",
            show: "Show statistics",
            maxSpecies2: " videos were captured. Of these, on",
            maxSpecies3: " a bird detected.",
            the: "The ",
            place: "Place ",
            on: "On ",
            day: "day ", 
            with: "with ",
            birds: "Birds ",
            maxSpecies5: " most birds were:",
            maxValidated2: " most validated Birds:",
            noValidated: "No birds have been validated at the station yet. Validate birds to see statistics about them here!  ",
            maxDay2: " days with the most Birds:",
            maxDay3: "Most bird on this day ",
            env2: "measurements were taken",
            maxTemp: "The highest temperature measured was: ",
            minTemp: "The lowest temperature measured was: ",
            maxHum: "The highest humidity measured was: ",
            minHum: "The lowest humidity measured was: ",
            averageTemp: "The average temperature measured was: ",
            averageHum: "The average humidity measured was: ",
            measured: "Measured on ",
            time: "",
            measuredStation: "Measured at the station :",
            single: {
                maxSpecies1: "At the station already ",
                maxValidated: "Some birds have also been validated at the station, namely ",   
                maxDay: " days, the station has recorded at least one bird. ",
                specialBirds: "These particular birds visited the station:"  ,   
                env1: "Besides birds, the station has already collected a lot of environmental data. In total"
            },
            all: {
                maxSpecies1: "In total, already ",
                maxValidated: "In total, a few birds have already been validated, namely ",    
                maxDay: " days, the stations have recorded at least one bird. ",
                specialBirds: "These particular birds visited the stations:"  ,    
                env1: "Besides birds, the stations have already collected a lot of environmental data. In total"        
            }
        },
        movementCard:{
            capturedOn: "Bird captured on:  ",
            propability: "Propability: ",
            goMov: "Go to Movement"
        }

    },
    de: {
        navbar: {
            create: "Erstelle Station",
            more:
                "Erfahre mehr über unser Projekt",
            overview: "Übersichtskarte",
            validation: "Validierung",
            statistics: "Statistiken"
        },

        map: {
            stationame: "Name der Station",
            inspect: "Beobachte Station",
            lastEnvironment: "Letzte Umweltmessung: ",
            lastMovement: "Letzter Vogel: ",
            statistics: "Zeige Statistiken",
            lastFeedStatus: "Letzer Futterstand: ",
            level: "Füllstand: "

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
            pressure: "Luftdruck in hPa: ",
            illuminance: "Helligkeit in Lux: ",
            birdsCount: "Gezählte Vögel:",
            yesterday: "Gestern",
            today: "Heute",
            search: "Zu suchende Art",
            search2: "Durchsuche Vögel",
            day: "Zu suchender Tag",
            notFound: "Die Station wurde nicht gefunden, du wirst in 5 Sekunden auf die Home Seite geleitet",
            exhibitInfo: "Hinweis: ",
            exhibitInfo2: "Dieses Movement würde ursprünglich von der Station ",
            exhibitInfo3: " aufgenommen und dient hier als Beispiel-Aufnahme."
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
            mail: "E-Mail Adresse",
            position: "Standort der Station (Gib die Koordinaten ein oder bewege den Marker in der Karte)",
            dataPrivacy: "Ihr müsst der Datenschutzerklärung zustimmen",
            finished: "Die Station wurde erfolgreich erstellt und hat die ID:",
            senseboxCreated: "Eine Sensebox auf der OpenSenseMap wurde erstellt.",
            senseboxNotCreated: "Es wurde KEINE Sensebox erstellt.",
            creating: "Die Station wird gerade erstellt",
            running: "Erstellen einer Station",
            overview: "Gehe zum Überblick",
            viewStation: "Beobachte Station",
            dataPrivacyText: "Ich akzeptiere, dass die hier bei diesem Formular und durch die Station gesammelten Daten auf unserer Website veröffentlicht werden. Die Mail-Adressen werden nicht veröffentlicht, sondern nur genutzt um euch zu benachrichtigen. Alle Daten können auf Anfrage gelöscht oder geändert werden.",
            opensensemapText: "Ich stimme zu, dass die Umweltdaten (Lufttemperatur und -feuchte) und der Standort meiner Station auch auf opensensemap.org veröffentlicht werden. Die dort erstellte senseBox soll von den Betreibern der Website wiediversistmeingarten.org verwaltet werden.",
            download: "Starte Download des Images",
            ssid: "W-Lan SSID eingeben, um WLAN automatisch zu konfigurieren",
            pwd: "W-Lan Password eingeben, um WLAN automatisch zu konfigurieren",
            createImage: "Erstelle ein Image, welches direkt auf der SSD-Karte installiert werden kann",
            creatingImage: "Das Image wird gerade erstellt. Wenn dies länger als 5 Minuten dauert, versuchen Sie bitte mehrmals, die Erstellung des Images neu zu starten. Wenn nach 15 Minuten kein Image erstellt werden konnte, laden Sie bitte das Image unter folgendem Link herunter. Aber achten Sie darauf, dass Sie dann das WLAN und die Stationeinstellungen (station_id) selbst konfigurieren müssen, bitte schauen Sie dazu in die Anleitung: ",
            stationConfig: "Konfiguration der Station",
            stationConfigText: "Hier können Prameter über die Station gesetzt werden, wie z.B. die W-Lan Einstellungen oder die Rotation der Kamera. Alle Parameter können auch später auf der Station gesetzt werden, hier wird aber eine nutzerfreudliche Eingabe ermöglicht. Die W-Lan Daten werden zweifach verschlüsselt an den Server gesendet und erst dort ausgelesen.",
            rotation: "Hier kann die Rotation für die Kamera gesetzt werden. Wenn das Kabel nach oben schaut 180 eintragen, wenn nach rechts 90",
            time: "Zeitinterval in Minuten, indem Umweltdaten gemessen werden sollen",
            notifications: "Möchtest du bei jedem Vogel per Mail benachrichtigt werdern",
            submit: "Erstelle Station",
            numberVisualExamples: "Anzahl an Beispielen, die auf der Station angezeigt werden sollen und von anderen Stationen aufgenommen wurden.",
            type: "Art der Station",
            typeHelper: 'Es gibt die Auswahl von 3 möglichen Arten. Die normale Station ist die Art "Observer" die dauerhaft Daten aufnimmt. Die Art "Test" bedeuted, dass die Station nicht auf der Karte angezeigt wird und Erkennungen automatisch gelöscht werden. Diese  ist für Entwicklungszwecke geeignet. Auch bei dem Typen "Exhibit" werdend die aufgenmonnen Videos automatisch gelöscht. Diese wird jedoch auf der Karte angezeigt. Zusätzlich können hier Beispiele von anderen Stationen angezeigt werden.',
            deleteMinutes: "Zeitintervall in Minuten, nach dem die aufgenommen Videos wieder gelsöcht werden",
            detectionThreshold: "Notwendige Wahrscheinlichkeit, ab dem die Erkennungen von der KI gespeichert werden.",
            detectionThresholdHelper: "Bsp: Bei 0,3 wird ein Erkennung gespeichert, wenn das Modell behauptet mit der Wahrscheinlichkeit von 30% ist der erkannte Vogel auf dem Video eine Blaumeise."
        },
        validation: {
            send: "Sende Validierung",
            noBird: "Kein Vogel im Video",
            next: "Gehen zum nächsten Vogel",
            form: "Vogel im Video"
        },
        statistics: {
            infoSum: "Um diese Statistik zu berechnen wird jeweils die Art, welche von dem Bilderkennungsmodell mit der höchsten Wahrscheinlichkeit bestimmt wurde, aufsummiert. Daher kann es auch vorkommen, dass Arten angezeigt werden, die nicht in deutschen Gärten vorkommen.",
            infoValidation: "In dieser Statistik wird angezeigt, wie oft eine bestimmte Art validiert wurde. Daher gibt sie keine Auskunft darüber, wie oft der Vogel an der Station war. Die Anzahl der Validerungen schließt auch Validierungen mit ein, falls kein Vogel auf dem Video erkannt worden kannte, diese werden jedoch nicht in der Ansicht unten angezeigt. Probiere es gerne direkt aus, die Statistik zu verbessern, indem du Videos deiner Station validierst. ",
            infoSpecialBirds: "Hier zeigen wir dir Arten, die schon einmal an einer unserer Station tatsächlich erkannt wurden. Es werden nur Erkennungen berücksichtigt, bei denen das Bilderkennungsmodell die Vorhersage mit einer Wahrscheinlichkeit von 85% oder höher ausgibt. Die Validierungen fließen nicht mit ein.",
            showMore: "Zeige mehr Statistiken",
            show: "Zeige Statistiken",
            maxSpecies2: " Videos aufgenommen. Davon wurde auf ",
            maxSpecies3: " ein Vogel erkannt.",
            the: "Die ",
            place: "Platz ",
            on: "An ",
            day: "Tag ", 
            with: "mit ",
            birds: "Vögeln ",
            maxSpecies5: " meisten Vögel waren:",
            maxValidated2: " meisten validierten Vögel:",
            noValidated: "An der Station wurden noch keine Vögel validiert. Validere Vögel um hier Statistiken darüber zu sehen! ",
            maxDay2: "Tage mit den meisten Vögel:",
            maxDay3: "Meister Vogel an dem Tag  ",
            env2: "Messungen durchgeführt",
            maxTemp: "Die höchste gemessene Temperatur war: ",
            minTemp: "Die niedrigste gemessene Temperatur war: ",
            maxHum: "Die höchste gemessene Luftfeuchtigkeit war: ",
            minHum: "Die niedirgste gemessene Luftfeuchtigkeit war: ",
            averageTemp: "Die durchschnittliche gemessene Temperatur ist: ",
            averageHum: "Die durchschnittliche gemessene Luftfeuchtigkeit ist: ",
            measured: "Gemessen am ",
            time: " Uhr",
            measuredStation: "Gemessen an der Station :",
            single: {
                maxSpecies1: "An der Station wurden schon " ,
                maxValidated: "An der Station wurden auch schon einige Vögel validiert und zwar ",   
                maxDay: " Tagen hat die Station mindestens einen Vogel aufgenommen. ",
                specialBirds: "Diese besonderen Vögel besuchten die Station:"  ,   
                env1: "Neben Vögeln hat die Station auch schon viele Umweltdaten gesammelt. Insgesamt wurden"
            },
            all: {
                maxSpecies1: "Insgesamt wurden schon ",
                maxValidated: "Insgesamt  wurden auch schon einige Vögel validiert und zwar ",    
                maxDay: "Tagen haben die Stationen mindestens einen Vogel aufgenommen. ",
                specialBirds: "Diese besonderen Vögel besuchten die Stationen:"  ,    
                env1: "Neben Vögeln haben die Stationen auch schon viele Umweltdaten gesammelt. Insgesamt wurden"        
            }
        },
        movementCard:{
            capturedOn: "Vogel aufgenommen am:  ",
            propability: "Wahrscheinlichkeit: ",
            goMov: "Gehe zum Movement"
        }
    }
};

export default language;