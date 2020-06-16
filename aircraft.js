/*All aircraft listed here*/

const aircraft = [
    {
        tail: "N383PS",
        model: "DA40F",
        emptyWeight: 1700.0,
        maxWeight: 2535,
        aircraftArm: 96.87
    },
    {
        tail: "N422FP",
        model: "DA40F",
        emptyWeight: 1697.0,
        maxWeight: 2535,
        aircraftArm: 96.76
    },
    {
        tail: "N423FP",
        model: "DA40F",
        emptyWeight: 1686.0,
        maxWeight: 2535,
        aircraftArm: 97.06
    },
    {
        tail: "N424FP",
        model: "DA40F",
        emptyWeight: 1703.4,
        maxWeight: 2535,
        aircraftArm: 97.52
    },
    {
        tail: "N425FP",
        model: "DA40F",
        emptyWeight: 1697.0,
        maxWeight: 2535,
        aircraftArm: 97.18
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
        emptyWeight: 1694.0,
        maxWeight: 2535,
        aircraftArm: 96.65
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
        emptyWeight: 1727.0,
        maxWeight: 2535,
        aircraftArm: 96.94
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
        emptyWeight: 1758.6,
        maxWeight: 2535,
        aircraftArm: 96.486
    },
    {
        tail: "N127KC",
        model: "DA40XLS",
        emptyWeight: 1809.0,
        maxWeight: 2646,
        aircraftArm: 98.32
    },
    {
        tail: "N230DC",
        model: "DA40XLS",
        emptyWeight: 1842.0,
        maxWeight: 2646,
        aircraftArm: 97.94
    },
    {
        tail: "N605CA",
        model: "DA40XLS",
        emptyWeight: 1804.0,
        maxWeight: 2646,
        aircraftArm: 99.04
    },
    {
        tail: "N704PA",
        model: "DA40XLS",
        emptyWeight: 1803.86,
        maxWeight: 2646,
        aircraftArm: 97.74
    },
    {
        tail: "N759PA",
        model: "DA40XLS",
        emptyWeight: 1800.56,
        maxWeight: 2646,
        aircraftArm: 97.11
    },
    {
        tail: "N78US",
        model: "DA40XL",
        emptyWeight: 1815.84,
        maxWeight: 2646,
        aircraftArm: 97.26,
        standardTank: true
    },
    {
        tail: "N79US",
        model: "DA40XL",
        emptyWeight: 1817.0,
        maxWeight: 2646,
        aircraftArm: 97.34,
        standardTank: true
    },
    {
        tail: "N831JL",
        model: "DA40XLS",
        emptyWeight: 1818.58,
        maxWeight: 2646,
        aircraftArm: 97.91
    }
   /* {
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
    }*/
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
        maxBaggage: 66,
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
        },
        vSpeeds : {
            vr : 59,
            vx : 66,
            vy : 66,
            vg : 73,
            va : {
                2161 : 94,
                2535 : 108
            }
        }
    },
    {
        model: "DA40CS",
        maxFuel: 40,
        maxBaggage: 66,
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
        },
        vSpeeds : {
            vr : 59,
            vx : 66,
            vy : 66,
            vg : 73,
            va : {
                2161 : 94,
                2535 : 108
            }
        }
    },
    {
        model: "DA40XL",
        maxFuel: 50,
        maxBaggage1 : 100,
        maxBaggage2 : 40,
        maxBaggage : 100,
        frontStationCG: 90.6,
        rearStationCG: 128,
        baggageStationCG: 153.1,
        baggageStation2CG: 178.7,
        fuelStationCG: 103.5,
        fuelType: "100LL",
        cgRange: {
            minAft: 102,
            midAft: 102,
            maxAft: 102,
            minFwd: 94.5,
            midFwd: 94.5,
            maxFwd: 97.6,
            minWgt: 1720,
            midWgt: 2161,
            maxWgt: 2646
        },
        vSpeeds : {
            vr : 59,
            vx : 66,
            vy : 66,
            vg : 73,
            va : {
                2161 : 94,
                2535 : 108,
                2646 : 111
            }
        }
    },
    {
        model: "DA40XLS",
        maxFuel: 50,
        maxBaggage1 : 100,
        maxBaggage2 : 40,
        maxBaggage : 100,
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
        },
        vSpeeds : {
            vr : 59,
            vx : 66,
            vy : 66,
            vg : 73,
            va : {
                2161 : 94,
                2535 : 108,
                2646 : 111
            }
        }
    },
    {
        model: "DA42",
        maxFuel: 50,
        maxAuxFuel : 26,
        maxNoseBaggage: 66,
        maxDeIce : 8.3,
        maxBaggage1 : 100,
        maxBaggage2 : 40,
        maxBaggage : 100,
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
        },
        vSpeeds : {
            vr : "70-72",
            vx : "-",
            vy : "78/86",
            vg : "-",
            vyse : 82,
            vmc : 68,
            va : {
                3400 : 120,
                3935 : 126
            }
        }
    }
    /* This is where you could add a new aircraft type, but if you have to add more variables then you would need
    to edit the javascript code to make use of those variables
     */
];