import database.db_connector
import unittest

class TestStringMethods(unittest.TestCase):  
    def test_read(self):
        self.assertEqual(database.db_connector.read(targetTable="testtable", pullParams=['id', 'test1', 'test2'], filter='', returnType='all'), [{'id': 1, 'test1': 'abc', 'test2': 'def'}, {'id': 2, 'test1': 'ghi', 'test2': 'jkl'}])

    def test_create(self):
        self.assertEqual(database.db_connector.create("testtable", {'id':3, 'test1': 'abc', 'test2': 'def'}), 0)

    def test_update(self):
        self.assertEqual(database.db_connector.update("testtable", {'test1': 'mno', 'test2': 'pqr'}, {'id':3}), None)

    def test_delete(self):
        self.assertEqual(database.db_connector.delete("testtable", {'id':3}), None)

if __name__ == '__main__':
    unittest.main()