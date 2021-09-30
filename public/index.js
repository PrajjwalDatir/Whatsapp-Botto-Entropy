/**
 * @author SomnathDas
 * More Updates Planned
*/

const tweenTop = KUTE.fromTo(
    "#curve-top-2",
    { path: "#curve-top-1" },
    { path: "#curve-top-2" },
    { repeat: 999, duration: 2600, yoyo: true }
)
  
tweenTop.start()
const tweenBottom = KUTE.fromTo(
    "#curve-bottom-2",
    { path: "#curve-bottom-1" },
    { path: "#curve-bottom-2" },
    { repeat: 999, duration: 2600, yoyo: true }
)
  
tweenBottom.start()
  