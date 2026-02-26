function calculateSplit() {
    const totalAmount = parseFloat(document.getElementById("totalAmount").value);
    const peopleCount = parseInt(document.getElementById("peopleCount").value);
    const includeTip = document.getElementById("includeTip").checked;

    if (!totalAmount || !peopleCount || peopleCount <= 0) {
        alert("Please enter valid values!");
        return;
    }

    let finalAmount = totalAmount;

    if (includeTip) {
        finalAmount += totalAmount * 0.10;
    }

    const perPerson = (finalAmount / peopleCount).toFixed(2);

    document.getElementById("perPersonAmount").innerText = "₹" + perPerson;
    document.getElementById("resultBox").style.display = "block";
}
