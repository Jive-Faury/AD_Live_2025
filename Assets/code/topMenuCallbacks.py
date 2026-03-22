"""
TopMenu callbacks

Callbacks always take a single argument, which is a dictionary
of values relevant to the callback. Print this dictionary to see what is
being passed. The keys explain what each item is.

TopMenu info keys:
	'widget': the TopMenu widget
	'item': the item label in the menu list
	'index': either menu index or -1 for none
	'indexPath': list of parent menu indexes leading to this item
	'define': TopMenu define DAT definition info for this menu item
	'menu': the popMenu component inside topMenu
"""

#################################
# exampleMenuDefine callbacks

def onQuit(info):
	"""
	A simple menu item callback, named in the Top Menu DAT table
	"""

def onSetting(info):
	"""
	A menu item callback that works on multiple menu items. The checkboxes in
	the menu evaluate the global guides and grid variables above to determine
	their state. The expressions used to evaluate the checkbox state are
	defined in the Top Menu DAT.
	"""
#	global guides, grid
#	if info['item'] == 'Show Guides':
#		guides = not guides
#	elif info['item'] == 'Show Grid':
#		grid = not grid

def getRecentFiles(info):
	"""
	A rowCallback used in the Top Menu DAT table to automatically generate rows.
	These callbacks must return a dictionary or list of dictionaries that mimic
	the columns in the Top Menu DAT. Dictionaries only need the columns with
	data in them, but must have corresponding columns in the Top Menu DAT in
	order to be recognized.
	"""
	return [
		{'item2': 'File 1'},
		{'item2': 'File 2', 'highlight': True},
		{'item2': 'File three', 'dividerAfter': True}
	]

# end examples
####################################

# standard menu callbacks

def onSelect(info):
	"""
	User selects a menu option
	"""
	

def onRollover(info):
	"""
	Mouse rolled over an item
	"""

def onOpen(info):
	"""
	Menu opened
	"""

def onClose(info):
	"""
	Menu closed
	"""

def onMouseDown(info):
	"""
	Item pressed
	"""

def onMouseUp(info):
	"""
	Item released
	"""

def onClick(info):
	if info['item'] == 'New Project':
		op.init.par.Resetall.pulse()
		a = ui.messageBox('Keep Attraktors List', 'Do you want to keep the attraktors list ?', buttons=['Yes', 'No'])
		if a == 1:
			op.formName.op('deleteAll').run()
		else:
			pass
		if a == 0 or a==1:
			b = ui.messageBox('New SnapShots Folder', 'Do you want to create a new SnapShots Folder ?', buttons=['Yes', 'No'])
			if b == 0:
				folder = ui.chooseFolder(title='Select Folder', start=project.folder)
				op.snapShots.par.Snapfolder = folder
				op.snapShots.par.Clearinit.pulse()
			else:
				pass
		path = ui.chooseFile(load=False, start=project.folder,fileTypes=['toe'],title='Save New Project as:')
		if (path):
			project.save(path)
			
	elif info['item'] == 'Reset Defaults Parameters':
		op.init.par.Resetall.pulse()
	elif info['item'] == 'Reset Particles':
		op.reset.click()
	elif info['item'] == 'Shortcuts List':
		op.shortcuts.openViewer()
	elif info['item'] == 'Parameters List':
		op.parsList.openViewer()
	elif info['item'] == 'Help':
		ui.viewFile('https://github.com/Jive-Faury/Attraktors_Designer_WIKI/wiki')
	elif info['item'] == 'Play/Stop Timeline':
		op.record.par.Play = 0 if op.record.par.Play == 1 else 1
	elif info['item'] == 'PostFx/Camera Mode':
			op.postEngine.par.Postscreen = 1 if op.postEngine.par.Postscreen == 0 else 0
	elif info['item'] == 'Quit':
		project.quit()
	elif info['item'] == 'Save Project As':
		path = ui.chooseFile(load=False,fileTypes=['toe'],title='Save Project as:')
		if (path):
			project.save(path)
	elif info['item'] == 'Save Project':
		project.save()

	"""
	Item pressed and released
	"""

def onLostFocus(info):
	"""
	Menu lost focus
	"""