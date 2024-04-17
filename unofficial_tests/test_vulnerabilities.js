
function calculateAddressHacking() {

    const availbe_address = (16n**38n);
    const maximum_used_address = (16n**15n)

    const rareness = availbe_address / maximum_used_address;

    const hashesPerSecond = rareness / 1_000_000n;

    //                  Seconds Minutes  Hours   Days    Years
    const secondsPerYear =  1n  *  60n  *  60n  *  24n  *  365n;
    
    const timeInYears = hashesPerSecond / secondsPerYear;

    console.log(timeInYears.toLocaleString());

}

calculateAddressHacking();
