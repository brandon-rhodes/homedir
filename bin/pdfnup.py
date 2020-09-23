# -*- coding: utf-8 -*-

"""Layout multiple pages per sheet of a PDF document.

Pdfnup is a Python module and command-line tool for layouting multiple
pages per sheet of a PDF document. Using it you can take a PDF document
and create a new PDF document from it where each page contains a number
of minimized pages from the original PDF file.

This can be considered a sample tool for the excellent package pyPdf by
Mathieu Fenniak, see http://pybrary.net/pyPdf.

For further information please look into the file README.txt!
"""


import os
import sys
import math
import zlib
import base64
import types
try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO


# try:
from PyPDF2 import PdfFileWriter, PdfFileReader
# except ImportError:
#     _MSG = "Please install pyPdf first, see http://pybrary.net/pyPdf"
#     raise RuntimeError(_MSG)

from PyPDF2.pdf import PageObject, ContentStream
try:
    from PyPDF2.pdf import ImmutableSet
except ImportError:
    ImmutableSet = frozenset
from PyPDF2.generic import (NameObject, DictionaryObject, ArrayObject,
    FloatObject)


__version__ = "0.4.2"
__license__ = "GPL 3"
__author__ = "Dinu Gherman"
__date__ = "2012-06-19"


# one empty A4 page as base64-encoded zipped PDF file
_mtA4PdfZip64 = """\
eJyVVV1z2joQfWeG/7CTDjcwbfA3mLY3MwFCyrRpUyDpbUOmI2wB7hiJWnKT9KF/oH3re39rVzI2
DrQPNzMO8mp1ztmjlVy76A+OrKZTrdR+/vj+C0Z0zRP5iszgjDKaEElDwBQIeZCuKJOwlHL91DBu
b2+bic6NyawZ8BUCwGGXiCgYcCbF4VMIYiKEWtyPAhlxRpJ7qFYsMIHPPqn0yZKCkISFJAlhrlZB
WKRWK8+fgzGwwMYFIzg+rlYoCzcrDwdWmWByv6aWokV8e4uvIy9o/IXKKCAZICqkOm6UJsA4ZQEP
I7YA413ETpiI8oCafE1WVElR43E6k8gGhuZUkYl+1Zg7Ii/Igj7QqQIo0dlK1JHdonuIRZUbbVW6
4jinYUS6/A6uwcR39Xgdr2m3vRYOfddq+n7HhxuVe0EStU+tfO2ICp4mARWgDVU6rXzuIuHBmEqE
NVCerobeSfU7XKGybjHqFaMh3Og6EZhLbA8txpgkhGmCzVxmiq5ux5SRW3akRySJ+QJNcbem9PNe
G3EuM0vepDKOGNbgF9IR+5yHyHIp6GvOaB4U29IzFTnHrhCvLGTI5hxVeLkKRXqSyiVPoE4YZ/cr
noqGAu0llKjt6qvi67Zp+mbH9i3PdCxbJ7yk97c8CQXUGxuPwzSgiLM9W387RI1Ni32igYR6ysSa
BtE8oqGemEQypios1SBs7FXU2m02gSW1tsau1X7IhNK8z1LVDFpzhHqvwdFn7ebhDoo9nnaZZ4yA
ZIVE7R0ioSc25ziKJVqAfXYy7g2HvteneL70ng1iNDJ7zZhfUbaQS2iZmjdHOSPrt0vz9N/BE/Ny
+sKJDq74+9Vn4/xx9+qD88/V0G043WdPhLh8vzo8mp2dHsiDyYeGfPTu47dj1J7DPCzELxdS9Fi1
4pfbILPJ3JpSJJZ9uUvovFoxoYP/ij9oeZ7jwbyIWRZarGdYEbPNzl7Madt7sZa7n9f29/E6HXc3
ZmFwL+aYJQ6ZkCimSVbxsI8eQK30MVj8+WNwdISXF3YINutfW1pBXdfZ1DHNqe26/eOpbTvx1Pba
U7ttv8WBNTUtGx8HH6v2XwP+V/YNqF1F0eoEe8Wth1cHuPnbOPpKobPpJ5LIbLMsx1PfvdrpG7z6
fgMis+cW
"""
_mtA4Pdf = zlib.decompress(base64.decodestring(_mtA4PdfZip64))


def isSquare(n):
    "Is this a square number?"

    s = math.sqrt(n)
    lower, upper = math.floor(s), math.ceil(s)

    return lower == upper


def isHalfSquare(n):
    "Is this a square number, divided by 2?"

    return isSquare(n * 2)


def calcScalingFactors(w, h, wp, hp):
    wp, hp = map(float, (wp, hp))

    if w == None:
        xscale = h / hp
        yscale = h / hp
    elif h == None:
        xscale = w / wp
        yscale = w / wp
    else:
        xscale = w / wp
        yscale = h / hp

    return xscale, yscale


def calcRects(pageSize, numTiles, dirs="RD"):
    "Return list of sub rects for some rect."

    allowdDirs = [x + y for x in "RL" for y in "UD"]
    allowdDirs += [y + x for x in "RL" for y in "UD"]
    assert dirs in allowdDirs

    width, height = pageSize
    n = numTiles
    xDir, yDir = dirs

    if isSquare(n):
        s = math.sqrt(n)
        w, h = float(width) / float(s), float(height) / float(s)
        if "R" in dirs:
            xr = range(0, int(s))
        elif "L" in dirs:
            xr = range(int(s) - 1, -1, -1)
        if "D" in dirs:
            yr = range(int(s) - 1, -1, -1)
        elif "U" in dirs:
            yr = range(0, int(s))
        xs = [i * w for i in xr]
        ys = [j * h for j in yr]
    elif isHalfSquare(n):
        # should issue a warning for page ratios different from 1:sqr(2)
        s = math.sqrt(2 * n)
        if width > height:
            w, h = float(width) / float(s), float(height) / float(s) * 2
            if "R" in dirs:
                xr = range(0, int(s))
            elif "L" in dirs:
                xr = range(int(s) - 1, -1, -1)
            if "D" in dirs:
                yr = range(int(s / 2) - 1, -1, -1)
            elif "U" in dirs:
                yr = range(0, int(s / 2))
            xs = [i * w for i in xr]
            ys = [j * h for j in yr]
        else:
            w, h = float(width) / float(s) * 2, float(height) / float(s)
            if "R" in dirs:
                xr = range(0, int(s / 2))
            elif "L" in dirs:
                xr = range(int(s / 2) - 1, -1, -1)
            if "D" in dirs:
                yr = range(int(s) - 1, -1, -1)
            elif "U" in dirs:
                yr = range(0, int(s))
            xs = [i * w for i in xr]
            ys = [j * h for j in yr]

    # decide order (first x, then y or first y then x)
    if dirs in "RD LD RU LU".split():
        rects = [(x, y, w, h) for y in ys for x in xs]
    elif dirs in "DR DL UR UL".split():
        rects = [(x, y, w, h) for x in xs for y in ys]

    return rects


def exP1multiN(pdf, newPageSize, n):
    "Extract page 1 of a PDF file, copy it n times resized."

    # create a file-like buffer object containing PDF code
    buf = StringIO()
    buf.write(pdf)

    # extract first page and resize it as desired
    srcReader = PdfFileReader(buf)
    page1 = srcReader.getPage(0)
    page1.mediaBox.upperRight = newPageSize

    # create output and copy the first page n times
    output = PdfFileWriter()
    for i in range(n):
        output.addPage(page1)

    # create a file-like buffer object to hold the new PDF code
    buf2 = StringIO()
    output.write(buf2)
    buf2.seek(0)

    return buf2


def isFileLike(obj):
    "Is this a file-like object?"

    if type(obj) == types.FileType:
        return True
    if set("read seek close".split()).issubset(set(dir(obj))):
        return True

    return False


def generateNup(inPathOrFile, n, outPathPatternOrFile=None, dirs="RD",
        verbose=False):
    """Generate a N-up document version.

    If outPathPatternOrFile is None, the output will be written
    in a file named after the input file.
    """

    assert isSquare(n) or isHalfSquare(n)

    ipof = inPathOrFile
    oppof = outPathPatternOrFile

    if isFileLike(ipof):
        inFile = ipof
        if oppof is None:
            raise AssertionError("Must specify output for file input!")
        elif isFileLike(oppof):
            outFile = oppof
        elif type(oppof) in types.StringTypes:
            outPath = oppof
            outFile = open(outPath, "wb")
    elif type(ipof) in types.StringTypes:
        inFile = open(ipof, "rb")
        if isFileLike(oppof):
            outFile = oppof
        elif oppof is None or type(oppof) in types.StringTypes:
            if oppof is None:
                oppof = "%(dirname)s/%(base)s-%(n)dup%(ext)s"
            aDict = {
                "dirname": os.path.dirname(inPathOrFile) or ".",
                "basename": os.path.basename(inPathOrFile),
                "base": os.path.basename(os.path.splitext(inPathOrFile)[0]),
                "ext": os.path.splitext(inPathOrFile)[1],
                "n": n,
            }
            outPath = oppof % aDict
            outPath = os.path.normpath(outPath)
            outFile = open(outPath, "wb")

    # get info about source document
    docReader = PdfFileReader(inFile)
    numPages = docReader.getNumPages()
    oldPageSize = docReader.getPage(0).mediaBox.upperRight

    # create empty output document buffer
    if isSquare(n):
        newPageSize = oldPageSize
    elif isHalfSquare(n):
        newPageSize = oldPageSize[1], oldPageSize[0]
    np = numPages / n + numPages % n
    buf = exP1multiN(_mtA4Pdf, newPageSize, np)

    # calculate mini page areas
    rects = calcRects(newPageSize, n, dirs)

    # combine
    ops = []
    newPageNum = -1
    for i in range(numPages):
        if i % n == 0:
            newPageNum += 1
        op = (inPathOrFile, i, (0, 0, None, None), i / n, rects[i % n])
        ops.append(op)

    srcr = srcReader = PdfFileReader(inFile)
    srcPages = [srcr.getPage(i) for i in range(srcr.getNumPages())]

    if type(oppof) in types.StringTypes:
        outFile = open(outPath, "rb")
    outr = outReader = PdfFileReader(buf)
    outPages = [outr.getPage(i) for i in range(outr.getNumPages())]
    output = PdfFileWriter()

    mapping = {}
    for op in ops:
        dummy, dummy, dummy, destPageNum, dummy = op
        if destPageNum not in mapping:
            mapping[destPageNum] = []
        mapping[destPageNum].append(op)

    IS = ImmutableSet
    PO, AO, DO, NO = PageObject, ArrayObject, DictionaryObject, NameObject

    for destPageNum, ops in mapping.items():
        for op in ops:
            inPathOrFile, srcPageNum, srcRect, destPageNum, destRect = op
            page2 = srcPages[srcPageNum]
            page1 = outPages[destPageNum]
            pageWidth, pageHeight = page2.mediaBox.upperRight
            destX, destY, destWidth, destHeight = destRect
            xScale, yScale = calcScalingFactors(
                destWidth, destHeight, pageWidth, pageHeight)

            newResources = DO()
            rename = {}
            orgResources = page1["/Resources"].getObject()
            page2Resources = page2["/Resources"].getObject()

            names = "ExtGState Font XObject ColorSpace Pattern Shading"
            for res in names.split():
                res = "/" + res
                new, newrename = PO._mergeResources(orgResources,
                    page2Resources, res)
                if new:
                    newResources[NO(res)] = new
                    rename.update(newrename)

            newResources[NO("/ProcSet")] = AO(
                IS(orgResources.get("/ProcSet", AO()).getObject()).union(
                    IS(page2Resources.get("/ProcSet", AO()).getObject())
                )
            )

            newContentArray = AO()
            orgContent = page1["/Contents"].getObject()
            newContentArray.append(PO._pushPopGS(orgContent, page1.pdf))
            page2Content = page2['/Contents'].getObject()
            page2Content = PO._contentStreamRename(page2Content, rename,
                page1.pdf)
            page2Content = ContentStream(page2Content, page1.pdf)
            page2Content.operations.insert(0, [[], "q"])

            # handle rotation
            try:
                rotation = page2["/Rotate"].getObject()
            except KeyError:
                rotation = 0
            if rotation in (180, 270):
                dw, dh = destWidth, destHeight
                arr = [-xScale, 0, 0, -yScale, destX + dw, destY + dh]
            elif rotation in (0, 90):
                arr = [xScale, 0, 0, yScale, destX, destY]
            else:
                # treat any other (illegal) rotation as 0
                arr = [xScale, 0, 0, yScale, destX, destY]

            arr = [FloatObject(str(x)) for x in arr]
            page2Content.operations.insert(1, [arr, "cm"])
            page2Content.operations.append([[], "Q"])
            newContentArray.append(page2Content)
            page1[NO('/Contents')] = ContentStream(newContentArray, page1.pdf)
            page1[NO('/Resources')] = newResources

        output.addPage(page1)

    if type(oppof) in types.StringTypes:
        outFile = open(outPath, "wb")
    output.write(outFile)

    if verbose:
        if type(oppof) in types.StringTypes:
            print "written: %s" % outPath
        elif isFileLike:
            print "written to file-like input parameter"
