
function calculateAddressHacking(length = 38n) {

    const availbe_address = (16n**length);
    const maximum_used_address = (16n**12n)

    const rareness = availbe_address / maximum_used_address;

    const hashesPerSecond = rareness / 1_000_000_000n;

    //                  Seconds Minutes  Hours   Days    Years
    const secondsPerYear =  1n  *  60n  *  60n  *  24n  *  365n;
    
    const timeInYears = hashesPerSecond / secondsPerYear;

    console.log(timeInYears.toLocaleString());

}

//calculateAddressHacking(38n);
calculateAddressHacking(40n);
