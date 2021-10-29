
const { Schema, model } = require("mongoose");

const InviteSchema = Schema({
    Id: { type: String, default: null },
    Inviter: { type: String, default: null },
    Total: { type: Number, default: 0 },
    Successful: { type: Number, default: 0 },
    Unsuccessful: { type: Number, default: 0 },
    Fake: { type: Boolean, default: false }
});
module.exports = model("Invites", InviteSchema);