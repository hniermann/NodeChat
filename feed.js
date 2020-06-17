
async function getStream(v){
    let s = null;
    try{
        s = await navigator.mediaDevices.getUserMedia({audio : true, video : true});
    }
    catch{
        Console.log("frick");
    }
    v.srcObject = s;
}
const vid = document.getElementById('video');
getStream(vid);
