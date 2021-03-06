;(function (root, $) {

  jQuery.expr[':'].icontains = function(a, i, m) {
    return jQuery(a).text().toUpperCase()
    .indexOf(m[3].toUpperCase()) >= 0;
  };

  var defaults = {

  };

  function RoomManager (options) {
    this.options = _.extend({}, defaults, options);
    this.rooms = [];
    this.prepare();
    this.bind();
  }

  RoomManager.prototype.prepare = function () {
    this.firebase = new Firebase(this.options.connection);
    this.reference = this.firebase.child(this.options.reference);

    this.elements = {};
    this.elements.$rooms = $(this.options.roomsEl);
    this.elements.$form = $(this.options.formEl);
    this.elements.$howItWorks = $(this.options.howItWorksBt);
    this.elements.$howItWorksClose = $(this.options.howItWorksClose);
    this.elements.$filter = $(this.options.filter);

  };

  RoomManager.prototype.bind = function () {
    this.firebase.on('child_added', this.onAddRoom.bind(this));
    this.elements.$form.on('submit', this.onSubmit.bind(this));

    this.elements.$howItWorks.on('click', this.hiwModal.bind(this));
    this.elements.$howItWorksClose.on('click', this.hiwModalClose.bind(this));

    this.elements.$filter.on('keyup', this.filter.bind(this));
  };

  RoomManager.prototype.filter = function(event) {
    var val = (event) ? event.target.value : this.elements.$filter.val();
    val = val.toLowerCase();

    $('#rooms > li').show();
    $('#rooms > li:not(:icontains("' + val + '"))').hide();
  };

  RoomManager.prototype.hiwModal = function(e) {
    e && e.preventDefault();

    $('.md-modal').addClass('md-show');
  };

  RoomManager.prototype.hiwModalClose = function() {
    $('.md-modal').removeClass('md-show');
  };

  RoomManager.prototype.getValue = function (name) {
    var value = this.elements.$form.find('[name="' + name + '"]')
      .val()
      .trim();

    this.clearValue(name);

    return value;
  };

  RoomManager.prototype.clearValue = function (name) {
    $('[name="' + name+ '"]').val('');
  };

  RoomManager.prototype.creteRoom = function (data) {
    return this.firebase.push({
      subject: data.subject,
      password: data.password,
      code: data.code
    });
  };

  RoomManager.prototype.onSubmit = function (event) {
    event && event.preventDefault();

    var subject = this.getValue('subject'),
        password = this.getValue('password') || null,
        response;

    if (!_.isUndefined(subject)) {
      response = this.creteRoom({
        subject: subject,
        password: password,
        code: "<!doctype html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Pear Programming</title>\n    <style>\n        body {\n            background: green;\n            color: white;\n        }\n    </style>\n</head>\n<body>\n    This is Pear Programming! Start coding and have fun :D\n</body>\n</html>"
      });

      this.goToRoom(response.key());
    }
  };

  RoomManager.prototype.goToRoom = function (roomId) {
    window.location = 'room.html?' + roomId;
  };

  RoomManager.prototype.onAddRoom = function (subject) {
    var values = subject.val(),
        room,
        users;

    room = new RoomElement({
      key: subject.key(),
      subject: values.subject,
      hasPassword: !!values.password,
      password: values.password,
      template: this.options.roomTemplate,
      developersReference: this.getReference(subject.key(), 'users_developer'),
      watchersReference: this.getReference(subject.key(), 'users_watch'),
      userLimit: 5,
      submit: subject
    });

    this.elements.$rooms.find(this.options.loader).remove();
    this.rooms.push(room.el);
    this.renderAllRooms();

    this.filter();
  };

  RoomManager.prototype.renderAllRooms = function() {
    var rooms = this.rooms.slice();
    rooms.reverse();
    rooms.forEach(function(e) {

      this.elements.$rooms.append(e);
    }.bind(this));
  };

  RoomManager.prototype.getReference = function (key, reference) {
    return this.firebase.child(key).child(reference);
  };

  RoomManager.prototype.getUsers = function (obj) {
    try {
      return Object.keys(obj).length;
    } catch (e) {
      return 0;
    }
  };

  root.RoomManager = RoomManager;

} (window, jQuery));
