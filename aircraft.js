/*All aircraft listed here*/

const aircraft = [
    {
        tail: "N383PS",
        model: "DA40F",
        emptyWeight: 1707.4,
        maxWeight: 2535,
        aircraftArm: 97.48
    },
    {
        tail: "N422FP",
        model: "DA40F",
        emptyWeight: 1715.5,
        maxWeight: 2535,
        aircraftArm: 97.37
    },
    {
        tail: "N423FP",
        model: "DA40F",
        emptyWeight: 1694.4,
        maxWeight: 2535,
        aircraftArm: 97.29
    },
    {
        tail: "N424FP",
        model: "DA40F",
        emptyWeight: 1697,
        maxWeight: 2535,
        aircraftArm: 96.89
    },
    {
        tail: "N425FP",
        model: "DA40F",
        emptyWeight: 1705.4,
        maxWeight: 2535,
        aircraftArm: 97.49
    },
    {
        tail: "N416FP",
        model: "DA40F",
        emptyWeight: 1697,
        maxWeight: 2535,
        aircraftArm: 96.87
    },
    {
        tail: "N417FP",
        model: "DA40F",
        emptyWeight: 1709.3,
        maxWeight: 2535,
        aircraftArm: 97.28
    },
    {
        tail: "N418FP",
        model: "DA40F",
        emptyWeight: 1697,
        maxWeight: 2535,
        aircraftArm: 96.88
    },
    {
        tail: "N420FP",
        model: "DA40F",
        emptyWeight: 1694,
        maxWeight: 2535,
        aircraftArm: 97.81
    },
    {
        tail: "N118GM",
        model: "DA40CS",
        emptyWeight: 1713.63,
        maxWeight: 2535,
        aircraftArm: 96.88
    },
    {
        tail: "N415AM",
        model: "DA40CS",
        emptyWeight: 1753.6,
        maxWeight: 2535,
        aircraftArm: 96.53
    },
    {
        tail: "N321FS",
        model: "DA40CS",
        emptyWeight: 1761,
        maxWeight: 2535,
        aircraftArm: 97.11
    },
    {
        tail: "N543JW",
        model: "DA40CS",
        emptyWeight: 1728.9,
        maxWeight: 2535,
        aircraftArm: 96.63
    },
    {
        tail: "N127KC",
        model: "DA40XL",
        emptyWeight: 1809,
        maxWeight: 2646,
        aircraftArm: 98.32
    },
    {
        tail: "N230DC",
        model: "DA40XL",
        emptyWeight: 1848,
        maxWeight: 2646,
        aircraftArm: 97.92
    },
    {
        tail: "N605CA*",
        model: "DA40XL",
        emptyWeight: 1848,
        maxWeight: 2646,
        aircraftArm: 97.92
    },
    {
        tail: "N759PA*",
        model: "DA40XL",
        emptyWeight: 1848,
        maxWeight: 2646,
        aircraftArm: 97.92
    },
    {
        tail: "N704PA*",
        model: "DA40XL",
        emptyWeight: 1848,
        maxWeight: 2646,
        aircraftArm: 97.92
    },
    {
        tail: "N831JL*",
        model: "DA40XL",
        emptyWeight: 1848,
        maxWeight: 2646,
        aircraftArm: 97.92
    },
    {
        tail: "N132TS",
        model: "DA42",
        emptyWeight: 2943.2,
        maxTOWeight: 3935,
        maxLDGWeight: 3748,
        aircraftArm: 95.05,
        auxTanks: true,
        deIce: true
    },
    {
        tail: "N240TS",
        model: "DA42",
        emptyWeight: 2756.6,
        maxTOWeight: 3935,
        maxLDGWeight: 3748,
        aircraftArm: 95.36,
        auxTanks: false,
        deIce: false
    },
    {
        tail: "N350TS",
        model: "DA42",
        emptyWeight: 2845,
        maxTOWeight: 3935,
        maxLDGWeight: 3748,
        aircraftArm: 95.16,
        auxTanks: false,
        deIce: false
    }
    /* To add a new aircraft, insert info block here. Note the DA42 requires more info (see DA42 block above)
        Follow the previous formatting:
    {
        tail : "N831JL",
        model : "DA40XL",   This is defined next in aircraftModels: DA40FP, DA40CS, DA40XL, DA42
        emptyWeight : 1848,
        maxWeight : 2646,
        aircraftArm : 97.92
    },
     */
];

const aircraftModels = [
    {
        model: "DA40F",
        maxFuel: 40,
        frontStationCG: 90.6,
        rearStationCG: 128,
        baggageStationCG: 143.7,
        fuelStationCG: 103.5,
        fuelType: "100LL",
        cgRange: {
            minAft: 102,
            midAft: 102,
            maxAft: 102,
            minFwd: 94.5,
            midFwd: 94.5,
            maxFwd: 96.9,
            minWgt: 1720,
            midWgt: 2161,
            maxWgt: 2535
        }
    },
    {
        model: "DA40CS",
        maxFuel: 40,
        frontStationCG: 90.6,
        rearStationCG: 128,
        baggageStationCG: 153.1,
        fuelStationCG: 103.5,
        fuelType: "100LL",
        cgRange: {
            minAft: 102,
            midAft: 102,
            maxAft: 102,
            minFwd: 94.5,
            midFwd: 94.5,
            maxFwd: 96.9,
            minWgt: 1720,
            midWgt: 2161,
            maxWgt: 2535
        }
    },
    {
        model: "DA40XL",
        maxFuel: 50,
        frontStationCG: 90.6,
        rearStationCG: 128,
        baggageStationCG: 153.1,
        baggageStation2CG: 178.7,
        fuelStationCG: 103.5,
        fuelType: "100LL",
        cgRange: {
            minAft: 100.4,
            midAft: 100.4,
            maxAft: 100.4,
            minFwd: 94.5,
            midFwd: 94.5,
            maxFwd: 97.6,
            minWgt: 1720,
            midWgt: 2161,
            maxWgt: 2646
        }
    },
    {
        model: "DA42",
        maxFuel: 50,
        frontStationCG: 90.6,
        rearStationCG: 128,
        noseBagStationCG: 23.6,
        baggageStationCG: 153.1,
        baggageStation2CG: 178.7,
        fuelStationCG: 103.5,
        auxStationCG: 126,
        deIceStationCG: 39.4,
        fuelType: "JETA",
        cgRange: {
            minAft: 95.28,
            midAft: 98.03,
            maxAft: 98.03,
            minFwd: 92.52,
            midFwd: 92.52,
            maxFwd: 94.49,
            minWgt: 2756,
            midWgtFwd: 3236,
            midWgtAft: 3527,
            maxWgt: 3935
        }
    }
    /* This is where you could add a new aircraft type, but if you have to add more variables then you would need
    to edit the javascript code to make use of those variables
     */
];