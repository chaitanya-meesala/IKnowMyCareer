IKMC.Objects = {};
IKMC.Objects.FeedbackQuestionObject = function(data){
   this.questionId = data.Id;
   this.description = data.description;
   this.type = data.type;
   this.options = data.options;
   this.suggestion = data.suggestion;
   this.answer = null; // Send string for short answer, option number for multiple choice, array of options for multi select
}
