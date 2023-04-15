const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }
  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("lifespan").get(function () {
  let dateOfBirth="";
  let dateOfDeath="";
  if (this.date_of_birth) {dateOfBirth = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);}
  if (this.date_of_death) {dateOfDeath = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);}
  return `${dateOfBirth} - ${dateOfDeath}`;
});

AuthorSchema.virtual("birth_value").get(function() {
  let birth="";
  if (this.date_of_birth) {birth = DateTime.fromJSDate(this.date_of_birth).toISODate(DateTime.DATE_SHORT);};
  return birth
})
AuthorSchema.virtual("death_value").get(function() {
  let death="";
  if (this.date_of_death) {death = DateTime.fromJSDate(this.date_of_death).toISODate(DateTime.DATE_SHORT);};
  return death
})

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
