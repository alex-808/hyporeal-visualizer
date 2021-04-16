// create songData object

class songData {
    constructor(rawData) {
        this.bars = rawData['bars'];
        this.beats = rawData['beats'];
        this.sections = rawData['sections'];
        this.segments = rawData['segments'];
        this.tatums = rawData['tatums'];

        this.tatumsStart = [];
        for (let i = 0; i < this.tatums.length; i++) {
            this.tatumsStart[i] = parseFloat(
                (this.tatums[i]['start'] * 1000).toFixed(2)
            );
        }

        this.beatsStart = [];
        for (let i = 0; i < this.beats.length; i++) {
            this.beatsStart[i] = parseFloat(
                (this.beats[i]['start'] * 1000).toFixed(2)
            );
        }

        this.segmentsStart = [];
        for (let i = 0; i < this.segments.length; i++) {
            this.segmentsStart[i] = parseFloat(
                (this.segments[i]['start'] * 1000).toFixed(2)
            );
        }

        this.sectionsStart = [];
        for (let i = 0; i < this.sections.length; i++) {
            this.sectionsStart[i] = parseFloat(
                (this.sections[i]['start'] * 1000).toFixed(2)
            );
        }

        this.barsStart = [];
        for (let i = 0; i < this.bars.length; i++) {
            this.barsStart[i] = parseFloat(
                (this.bars[i]['start'] * 1000).toFixed(2)
            );
        }

        //get this working maybe
        this.sectionNearestBarStart = [];

        for (let i = 1; i < this.sectionsStart.length; i++) {
            this.sectionNearestBarStart[i] = -100;
            // console.log(this.sectionsStart[i])
            for (let j = 0; j < this.barsStart.length; j++) {
                // console.log(Math.abs(this.sectionsStart[i] - this.barsStart[j]))
                // if(i = 0) {
                //   this.sectionNearestBarStart[i] = 0
                // }
                // else {
                if (
                    Math.abs(this.sectionsStart[i] - this.barsStart[j]) <
                    Math.abs(this.sectionNearestBarStart[i] - this.barsStart[j])
                ) {
                    this.sectionNearestBarStart[i] = this.barsStart[j];
                    // console.log('difference', this.sectionsStart[i] - this.barsStart[j])
                    // console.log('start', this.sectionNearestBarStart[i])
                }
                // }
            }
        }
        this.sectionNearestBarStart[0] = 0;
        for (var i = 0; i < this.sectionNearestBarStart.length; i++) {
            // console.log(Math.abs(this.sectionNearestBarStart[i] - this.sectionsStart[i]))
        }
    }
}

export { songData };
