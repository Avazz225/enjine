import helpers

import unittest

class TestStringMethods(unittest.TestCase):  
    def test_safe(self):
        self.assertEqual(helpers.toStr('Test'),'Test')

    def test_unsafe1(self):
        self.assertEqual(helpers.toStr('Test\'"; DROP DATABASE'),'Test  DROP DATABASE')


if __name__ == '__main__':
    unittest.main()